from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from nltk.stem.porter import PorterStemmer
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from spellchecker import SpellChecker
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from collections import defaultdict
from tests.models import Quiz, Question, Choice, Answer, Response
import json
from absl import logging
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from scipy.spatial.distance import euclidean
import heapq

# NOTE: run these once
# nltk.download('stopwords')
# nltk.download('wordnet')
# nltk.download('averaged_perceptron_tagger')

PLAG_THRESHOLD = 0.8
N_PER_CLUSTER = 2

"""
2 ML models

A) Plagiarism Detection
    base model: cosine similarity
    text -> preprocess -> bag of words -> cosine sim score

B) Autograding
    using universal sentence encoder from Google to transform sentence into an embedding vector
    two grading principles
    1) semi supervised (teacher grades less students by just grading few students in a cluster)
    2) automatic semantic similarity based grading
"""


# https://tfhub.dev/google/universal-sentence-encoder/4
print(os.getcwd(), 'here')
print(os.listdir())
model = hub.load('./universal-sentence-encoder_4')
logging.set_verbosity(logging.ERROR)


def embed(input):
    return model(input)


class AutoGrading:
    def __init__(self, answers):
        self.answers = answers
        self.answer_embeddings = np.array(embed(self.answers))
        self.hca = AgglomerativeClustering()

    def print_embedding(self, index):
        answer_embedding = self.answer_embeddings[index]
        print("Answer: {}".format(self.answers[index]))
        print("Embedding size: {}".format(len(answer_embedding)))
        answer_embedding_snippet = ", ".join(
            (str(x) for x in answer_embedding[:3]))
        print("Embedding: [{}, ...]\n".format(answer_embedding_snippet))

    def fit(self):
        self.hca.fit(self.answer_embeddings)

    def get_cluster_centers(self):
        cluster_centers = {}
        for i in range(self.hca.n_clusters):
            center = self.answer_embeddings[self.hca.labels_ == i].mean(axis=0)
            cluster_centers[i] = center
        return cluster_centers

    # select the N clusters which are nearest to the cluster center
    def select_clusters(self, label, center_vector, n):
        candidates = self.answer_embeddings[self.hca.labels_ == label]
        indices = np.nonzero(self.hca.labels_ == label)[0]
        # if there are less points in cluster than n
        n = min(len(candidates), n)
        distances = []
        heapq.heapify(distances)
        for index, candidate in zip(indices, candidates):
            distance = euclidean(center_vector, candidate)
            heapq.heappush(distances, (distance, index))
        selected_clusters = []
        for i in range(n):
            selected_clusters.append(heapq.heappop(distances)[1])
        return selected_clusters

    def score_cluster_centers(self, n_per_cluster=3):
        data = np.array(self.answer_embeddings)
        cluster_centers = self.get_cluster_centers()
        results = []
        for i in range(self.hca.n_clusters):
            label = i
            selected_clusters = self.select_clusters(
                label, cluster_centers[i], n_per_cluster)
            results.append(selected_clusters)
        return results

    def get_nearest_cluster(self, label, index, scored_clusters):
        points = scored_clusters[label]
        src_point = self.answer_embeddings[index]
        min_distance = float('inf')
        min_distance_idx = -1
        for p in points:
            dist = euclidean(self.answer_embeddings[p], src_point)
            if dist < min_distance:
                min_distance = dist
                min_distance_idx = p
        return min_distance_idx

    def grade_all(self, score_dict):
        scored_clusters = score_cluster_centers(
            hca, answer_embeddings, N_PER_CLUSTER)
        result = {}  # mapping index -> grade obtained
        for i in range(self.hca.n_clusters):
            scored = scored_clusters[i]
            indices = np.nonzero(self.hca.labels_ == i)[0]
            for idx in indices:
                if idx not in scored:
                    nearest_point = self.get_nearest_cluster(
                        i, idx, scored_clusters)
                    result[idx] = score_dict[nearest_point]
                else:
                    result[idx] = score_dict[idx]
        return result

    def automated_grading(self, expected_answer, scale=5):
        print(expected_answer)
        expected_answer = np.array(embed([expected_answer]))
        print(expected_answer.shape)
        print(self.answer_embeddings.shape)
        results = []
        for i in range(len(self.answer_embeddings)):
            similarity = cosine_similarity(
                expected_answer, self.answer_embeddings[i].reshape(1, -1))
            results.append(similarity * scale)
        return results

class PlagiarismDetection:
    stop_words = set(stopwords.words('english'))
    wordnet_map = {"N": wordnet.NOUN, "V": wordnet.VERB,
                   "J": wordnet.ADJ, "R": wordnet.ADV}
    vectorizer = CountVectorizer(max_features=5000)

    def __init__(self, text, threshold, fast=False, ignore_spellings=True):
        self.text = text
        self.threshold = threshold
        self.speed_required = fast
        self.ignore_spellings = ignore_spellings
        self.stemmer = PorterStemmer()
        self.lemma = WordNetLemmatizer()  # this is slower
        self.spell = SpellChecker()

    # https://www.kaggle.com/sudalairajkumar/getting-started-with-text-preprocessing

    def preprocess_text(self):
        text = self.text.lower().strip()
        text = re.sub(r'\d+', '', text)  # remove numbers
        # if process needs to be fast use stemming which is faster otherwise use lemmatization
        if not self.speed_required:
            pos_tagged_text = nltk.pos_tag(text.split())
            text = " ".join([self.lemma.lemmatize(word, PlagiarismDetection.wordnet_map.get(
                pos[0], wordnet.NOUN)) for word, pos in pos_tagged_text])
        else:
            text = " ".join([self.stemmer.stem(word) for word in text.split()])
        # remove stopwords
        text = " ".join([word for word in str(
            text).split() if word not in PlagiarismDetection.stop_words])
        table = str.maketrans(dict.fromkeys(
            string.punctuation))  # remove puncutation
        text = text.translate(table)
        self.text = text
        # correct spelling mistakes
        if not self.ignore_spellings:
            self.correct_spellings()
        print(f"After correction: {self.text}")

    def correct_spellings(self):
        corrected_text = []
        misspelled_words = self.spell.unknown(self.text.split())
        for word in self.text.split():
            if word in misspelled_words:
                corrected_text.append(self.spell.correction(word))
            else:
                corrected_text.append(word)
        self.text = ' '.join(corrected_text)

    def vectorize(self):
        features = PlagiarismDetection.vectorizer.transform([self.text])
        return features

    def get_text(self):
        return self.text

    @staticmethod
    def cosine_similarity(vectorized_text, vectorized_corpus, top_k=5):
        """
        Get the cosine similarity by comparing one text with all many other texts.
        Arguments:
            vectorized_text {list} -- Text to be compared (student submission)
            vectorized_corpus {list of lists} -- All other texts (submission of all other students)
            top_k {int} -- Maximum number of indices to return with highest cosine similarity
        Returns:
            The indices of the top_k elements from vectorized_corpus with the highest cosine similarity
            with vectorized_text
        """
        cosine_similarities = cosine_similarity(
            vectorized_text, vectorized_corpus).flatten()
        # https://stackoverflow.com/questions/6910641/how-do-i-get-indices-of-n-maximum-values-in-a-numpy-array
        top_k = min(len(cosine_similarities), top_k)
        ind = np.argpartition(cosine_similarities, -top_k)[-top_k:]
        filter_arr = [True if cosine_similarities[i]
                      >= PLAG_THRESHOLD else False for i in ind]
        ind = ind[filter_arr]
        ind = ind[np.argsort(cosine_similarities[ind])][::-1]
        return ind

    @staticmethod
    def fit_vectorizer(preprocessed_corpus):
        PlagiarismDetection.vectorizer.fit(preprocessed_corpus)
        return PlagiarismDetection.vectorizer.transform(preprocessed_corpus)

# def get_similar()


def detect_plagiarism(corpus):
    # corpus = ['This is a corpus of text',
    #           'Unrelated things', 'This is another corpus of text']
    preprocessed_corpus_objects = []
    preprocessed_corpus = []
    for text in corpus:
        p = PlagiarismDetection(text, PLAG_THRESHOLD,
                                fast=False, ignore_spellings=True)
        p.preprocess_text()
        preprocessed_corpus_objects.append(p)
        preprocessed_corpus.append(p.get_text())

    print('preprocessed', preprocessed_corpus)
    doc_features = PlagiarismDetection.fit_vectorizer(preprocessed_corpus)

    features = [obj.vectorize() for obj in preprocessed_corpus_objects]
    similar_text = []
    for n in range(len(features)):
        similar_text.append(PlagiarismDetection.cosine_similarity(
            features[n], doc_features))
    print(similar_text)
    return similar_text
    # return HttpResponse("ml_info")


def plagiarism_detection(request, quiz_id):
    """
    This is API endpoint that returns the JSON Response for plagiarism.
    ML API
    Plagiarism Detection
    1) Get all responses for the Quiz
    2) For MCQ, auto grade
    3) For Short Answer questions, collect information and send to this end point
    4) It will generate cosine similarity matrix and return a list of tuples for which the similarity
       increases the threshold value
    5) Show results in Dashboard

    Arguments:
        request {quiz_id} -- The ID of the Quiz for which to run the plagiarism detection

    Returns:
        JSON Response -- Answers with plagiarism exceeding threshold
    """
    response = defaultdict(lambda: defaultdict(
        list))  # response -> similar responses
    print(quiz_id)
    quiz_id = int(quiz_id)
    quiz = Quiz.objects.get(id=quiz_id)
    responses = Response.objects.filter(test=quiz)
    print(len(responses))
    answers = []
    # maintain the same order of questions for every student
    for i in range(len(responses)):
        answers.append([answer for answer in Answer.objects.filter(
            response=responses[i]).order_by('question_id')])
    questions = []
    for answer in answers[0]:
        questions.append(answer.question)

    for idx in range(len(responses)):
        response[responses[idx].id] = defaultdict(list)

    for idx, question in enumerate(questions):
        if question.type == 1:
            # short-answer
            text_answers = [answer[idx].short_ans for answer in answers]
            print(text_answers)
            similar_text = detect_plagiarism(text_answers)
            for i, s in enumerate(similar_text):
                similar = [int(x) for x in s]  # numpy int cannot be serialized
                # remove 100% plagiarism with the response itself
                similar.remove(i)
                similar = [responses[ele].id for ele in similar]
                for j in range(len(similar)):
                    response[responses[i].id][similar[j]].append(question.id)
    print(response)
    return JsonResponse(response)


def auto_grading(request, quiz_id):
    type = 1
    quiz = Quiz.objects.get(id=int(quiz_id))
    responses = Response.objects.filter(test=quiz)
    print(responses)
    answers = defaultdict(list)

    for i in range(len(responses)):
        response = responses[i]
        response_answers = [answer for answer in Answer.objects.filter(
            response=response).order_by('question_id')]
        answers[response.taken_by.username] = response_answers

    print(answers)

    questions = []
    student_names = list(answers.keys())
    ans = answers[student_names[0]]
    for i in range(len(ans)):
        questions.append(ans[i].question)

    print(questions, 'questions')

    expected_answers = []
    for i in range(len(questions)):
        question = questions[i]
        if question.type == 1: # short answer
            expected_answers.append([1, question.ans])
        else: # mcq
            expected_answers.append([2])

    print(expected_answers)

    for q in range(len(questions)):
        if questions[q].type == 1: # short answer
            student_answers = []
            for a in range(len(answers.keys())):
                student = student_names[a]
                student_answers.append(str(answers[student][q]))
            autograder = AutoGrading(student_answers)
            scores = autograder.automated_grading(expected_answer=expected_answers[q][1])
            print(scores)

    return HttpResponse("ok")

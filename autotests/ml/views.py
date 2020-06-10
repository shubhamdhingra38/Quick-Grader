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
from math import ceil
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering
from scipy.spatial.distance import euclidean
import heapq
import pickle


# NOTE: run these once
# nltk.download('stopwords')
# nltk.download('wordnet')
# nltk.download('averaged_perceptron_tagger')

PLAG_THRESHOLD = 0.8
N_PER_CLUSTER = 1

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
        scored_clusters = self.score_cluster_centers(N_PER_CLUSTER)
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
        # print(expected_answer.shape)
        # print(self.answer_embeddings.shape)
        results = []
        for i in range(len(self.answer_embeddings)):
            similarity = cosine_similarity(
                expected_answer, self.answer_embeddings[i].reshape(1, -1))
            scaled_similarity = similarity[0] * scale
            results.append(scaled_similarity[0])
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


def detect_plagiarism(corpus):
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


def plagiarism_detection(request, quiz_code):
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
        request {quiz_code} -- The code of the Quiz for which to run the plagiarism detection

    Returns:
        JSON Response -- Answers with plagiarism exceeding threshold
    """
    response = defaultdict(lambda: defaultdict(
        list))  # response -> similar responses
    quiz = Quiz.objects.get(code=quiz_code)
    responses = Response.objects.filter(test=quiz)
    print(len(responses))
    answers = []
    # maintain the same order of questions for every student
    for i in range(len(responses)):
        answers.append([answer for answer in Answer.objects.filter(
            response=responses[i]).order_by('question_id')])
    questions = []

    if len(answers) <= 1:
        return JsonResponse({"message": "There must be at least 2 responses to perform this action"},
                            status=400)

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
                if i in similar:
                    similar.remove(i)
                similar = [responses[ele].id for ele in similar]
                for j in range(len(similar)):
                    response[responses[i].id][similar[j]].append(question.id)
    print(response)
    return JsonResponse(response)


def auto_grading(request, quiz_id):

    quiz = Quiz.objects.get(id=int(quiz_id))
    responses = Response.objects.filter(test=quiz)
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
        if question.type == 1:  # short answer
            expected_answers.append([1, question.ans])
        else:  # mcq
            expected_answers.append([2])

    print(expected_answers)

    for q in range(len(questions)):
        if questions[q].type == 1:  # short answer
            student_answers = []
            for a in range(len(answers.keys())):
                student = student_names[a]
                student_answers.append(str(answers[student][q]))
            autograder = AutoGrading(student_answers)
            scores = autograder.automated_grading(
                expected_answer=expected_answers[q][1], scale=questions[q].maximum_score)
            print(scores)
            scores = [max(ceil(x), 0) for x in scores]
            print('cleaned', scores)
            for a in range(len(answers.keys())):
                student = student_names[a]
                answers[student][q].score = scores[a]
                answers[student][q].save()
        elif questions[q].type == 2:  # MCQ
            for a in range(len(answers.keys())):
                student = student_names[a]
                if Choice.objects.get(id=answers[student][q].choice_id).is_answer:
                    # total_score += answer.question.maximum_score
                    answers[student][q].score = answers[student][q].question.maximum_score
                    answers[student][q].save()

    return HttpResponse("ok")


def supervised_automatic_grading(request, quiz_id):
    try:
        response = get_cluster_centers(quiz_id)
    except (ValueError, IndexError):
        return JsonResponse({"message": "This action cannot be performed when there are less than 2 responses"},
                            status=400)
    return JsonResponse(response)


def get_cluster_centers(quiz_id):

    quiz = Quiz.objects.get(id=int(quiz_id))
    responses = Response.objects.filter(test=quiz)
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

    response = defaultdict(list)

    for q in range(len(questions)):
        if questions[q].type == 1:  # short answer
            student_answers = []
            for a in range(len(answers.keys())):
                student = student_names[a]
                student_answers.append(str(answers[student][q]))
            autograder = AutoGrading(student_answers)
            autograder.fit()
            res = autograder.score_cluster_centers(N_PER_CLUSTER)
            with open(f'./cache/ques{questions[q].id}_autograder.pkl', 'wb') as f:
                pickle.dump(autograder, f)
            print(res)
            for group in res:
                for idx in group:
                    idx = int(idx)
                    response[questions[q].id].append(
                        answers[student_names[idx]][q].id)
        print(response)
    return response


def grade_others_in_cluster(request, quiz_id):
    # the cluster centers which are graded
    response = get_cluster_centers(quiz_id)
    quiz = Quiz.objects.get(id=int(quiz_id))
    responses = Response.objects.filter(test=quiz)
    answers = defaultdict(list)
    # print(response, 'response here')

    questions_ids = response.keys()
    # print(questions_ids)

    for q_id in questions_ids:
        with open(f'./cache/ques{q_id}_autograder.pkl', 'rb') as f:
            autograder = pickle.load(f)
        question = Question.objects.get(id=q_id)
        answers = Answer.objects.filter(question=question)
        # print(answers)
        # print([x.id for x in answers])
        score_dict = {}
        for idx, answer in enumerate(answers):
            if answer.id in response[q_id]:
                score_dict[idx] = answer.score

        # print(score_dict)
        result = autograder.grade_all(score_dict)
        for r in result.keys():
            r = int(r)
            answers[r].score = result[r]
            answers[r].save()

    calculate_total_score(quiz_id)
    return HttpResponse("ok")


def calculate_total_score(quiz_id):
    print("This is called...")
    quiz = Quiz.objects.get(id=quiz_id)
    questions = list(Question.objects.filter(test=quiz))
    total_scores = defaultdict(int)
    for idx, question in enumerate(questions):
        answers = Answer.objects.filter(question=question)
        for answer in answers:
            if question.type == 1:  # short answer
                total_scores[answer.response.taken_by.username] += answer.score
            else:  # mcq
                if Choice.objects.get(id=answer.choice_id).is_answer:
                    answer.score = question.maximum_score
                    answer.save()
                total_scores[answer.response.taken_by.username] += answer.score
        if idx == len(questions) - 1:
            # print('here')
            for answer in answers:
                # print(answer.response.id, 'id')
                answer.response.total_score = total_scores[answer.response.taken_by.username]
                answer.response.save()
    print(total_scores)

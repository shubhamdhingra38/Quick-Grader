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


# NOTE: run these once
# nltk.download('stopwords')
# nltk.download('wordnet')
# nltk.download('averaged_perceptron_tagger')

PLAG_THRESHOLD = 0.8

"""
    base model: cosine similarity
    text -> preprocess -> bag of words -> cosine sim score
"""


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
        filter_arr = [True if cosine_similarities[i] >= PLAG_THRESHOLD else False for i in ind]
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
        similar_text.append(PlagiarismDetection.cosine_similarity(features[n], doc_features))
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
    response = defaultdict(lambda : defaultdict(list)) # response -> similar responses
    print(quiz_id)
    quiz_id = int(quiz_id)
    quiz = Quiz.objects.get(id=quiz_id)
    responses = Response.objects.filter(test=quiz)
    print(len(responses))
    answers = []
    # maintain the same order of questions for every student
    for i in range(len(responses)):
        answers.append([answer for answer in Answer.objects.filter(response=responses[i]).order_by('question_id')])
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
                similar = [int(x) for x in s] # numpy int cannot be serialized
                similar.remove(i) # remove 100% plagiarism with the response itself
                similar = [responses[ele].id for ele in similar]
                for j in range(len(similar)):
                    response[responses[i].id][similar[j]].append(question.id)
    print(response)
    return JsonResponse(response)

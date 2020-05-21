# from django.shortcuts import render
# from django.http import HttpResponse
# import re
# import string
# import nltk
# from nltk.corpus import stopwords
# from nltk.tokenize import word_tokenize
# from sklearn.feature_extraction.text import CountVectorizer
# from nltk.stem.porter import PorterStemmer
# from nltk.stem import WordNetLemmatizer
# from nltk.corpus import wordnet
# from spellchecker import SpellChecker
# from sklearn.metrics.pairwise import cosine_similarity
# import numpy as np

# # NOTE: run these once
# # nltk.download('stopwords')
# # nltk.download('wordnet')
# # nltk.download('averaged_perceptron_tagger')

# PLAG_THRESHOLD = 0.8

# """
#     base model: cosine similarity
#     text -> preprocess -> bag of words -> cosine sim score
# """


# class PlagiarismDetection:
#     stop_words = set(stopwords.words('english'))
#     wordnet_map = {"N": wordnet.NOUN, "V": wordnet.VERB,
#                    "J": wordnet.ADJ, "R": wordnet.ADV}
#     vectorizer = CountVectorizer(max_features=5000)

#     def __init__(self, text, threshold, fast=False, ignore_spellings=True):
#         self.text = text
#         self.threshold = threshold
#         self.speed_required = fast
#         self.ignore_spellings = ignore_spellings
#         self.stemmer = PorterStemmer()
#         self.lemma = WordNetLemmatizer()  # this is slower
#         self.spell = SpellChecker()

#     # https://www.kaggle.com/sudalairajkumar/getting-started-with-text-preprocessing

#     def preprocess_text(self):
#         text = self.text.lower().strip()
#         text = re.sub(r'\d+', '', text)  # remove numbers
#         # if process needs to be fast use stemming which is faster otherwise use lemmatization
#         if not self.speed_required:
#             pos_tagged_text = nltk.pos_tag(text.split())
#             text = " ".join([self.lemma.lemmatize(word, PlagiarismDetection.wordnet_map.get(
#                 pos[0], wordnet.NOUN)) for word, pos in pos_tagged_text])
#         else:
#             text = " ".join([self.stemmer.stem(word) for word in text.split()])
#         # remove stopwords
#         text = " ".join([word for word in str(
#             text).split() if word not in PlagiarismDetection.stop_words])
#         table = str.maketrans(dict.fromkeys(
#             string.punctuation))  # remove puncutation
#         text = text.translate(table)
#         self.text = text
#         # correct spelling mistakes
#         if not self.ignore_spellings:
#             self.correct_spellings()
#         print(f"After correction: {self.text}")

#     def correct_spellings(self):
#         corrected_text = []
#         misspelled_words = self.spell.unknown(self.text.split())
#         for word in self.text.split():
#             if word in misspelled_words:
#                 corrected_text.append(self.spell.correction(word))
#             else:
#                 corrected_text.append(word)
#         self.text = ' '.join(corrected_text)

#     def vectorize(self):
#         features = PlagiarismDetection.vectorizer.transform([self.text])
#         return features

#     def get_text(self):
#         return self.text

#     @staticmethod
#     def cosine_similarity(vectorized_text, vectorized_corpus, top_k=5):
#         """
#         Get the cosine similarity by comparing one text with all many other texts.
#         Arguments:
#             vectorized_text {list} -- Text to be compared (student submission)
#             vectorized_corpus {list of lists} -- All other texts (submission of all other students)
#             top_k {int} -- Maximum number of indices to return with highest cosine similarity
#         Returns:
#             The indices of the top_k elements from vectorized_corpus with the highest cosine similarity
#             with vectorized_text
#         """
#         cosine_similarities = cosine_similarity(
#             vectorized_text, vectorized_corpus).flatten()
#         # https://stackoverflow.com/questions/6910641/how-do-i-get-indices-of-n-maximum-values-in-a-numpy-array
#         top_k = min(len(cosine_similarities), top_k)
#         ind = np.argpartition(cosine_similarities, -top_k)[-top_k:]
#         filter_arr = [True if cosine_similarities[i] >= PLAG_THRESHOLD else False for i in ind]
#         ind = ind[filter_arr]
#         ind = ind[np.argsort(cosine_similarities[ind])][::-1]
#         return ind

#     @staticmethod
#     def fit_vectorizer(preprocessed_corpus):
#         PlagiarismDetection.vectorizer.fit(preprocessed_corpus)
#         return PlagiarismDetection.vectorizer.transform(preprocessed_corpus)


# def ml_info(request):
#     corpus = ['This is a corpus of text',
#               'Unrelated things', 'This is another corpus of text']
#     preprocessed_corpus_objects = []
#     preprocessed_corpus = []
#     for text in corpus:
#         p = PlagiarismDetection(text, PLAG_THRESHOLD,
#                                 fast=False, ignore_spellings=True)
#         p.preprocess_text()
#         preprocessed_corpus_objects.append(p)
#         preprocessed_corpus.append(p.get_text())

#     doc_features = PlagiarismDetection.fit_vectorizer(preprocessed_corpus)

#     features = [obj.vectorize() for obj in preprocessed_corpus_objects]
#     res = PlagiarismDetection.cosine_similarity(features[0], doc_features)
#     print(res)
#     return HttpResponse("ml_info")


# def plagiarism_detection(request):
#     return HttpResponse("plag detection")

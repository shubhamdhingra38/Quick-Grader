# Quick Grader
This project aims to provide an  automated  manner in which students can be evaluated. Inspired by the need of a  simplistic platform  which can be used for academic purpose during the pandemic.

Through use of Artificial Intelligence, two key features are included.

 1.   Plagiarism Detection
 2.   Auto Grading
### Plagiarism Detection
For plagiarism detection, traditional NLP approaches are used such as Preprocessing and Tokenization (Bag of Words), Stemming, Lemmatization and POS tagging along with removal of StopWords. This was chosen because often while plagiarising corpus of texts during a test, students will change the order or the syntactic structure of the paragraph or sentence. A more sophisticated model might make assumptions about semantic similarity, which makes less sense when plagiarism is the issue. Cosine similarity is used as a metric for the degree of similarity after vectorization.
### Auto Grading
There are two methods of making the grading process easier:
 
 1. Semi-supervised grading
 2. Unsupervised automated grading

*Hierarchical Clustering*  is used for grouping together of answers submitted by the students. This enables the teacher to only manually grade a few points in the cluster (around the center) and other points belonging to that cluster can be graded through the score assigned to the nearest point in that particular cluster.

A fully automated option of grading every student is also provided. This requires no human effort but suffers from a lot of logical fallacies and edge cases to be handled, and was found to be drastically less reliable method.

Content Similarity is measured through use of pre-trained sentence embedding model called  [Universal Sentence Encoder](https://tfhub.dev/google/universal-sentence-encoder/4) - by Google.

## Technology Stack
Initially, I used Django's template system to write Jinja for front end along with JavaScript + jQuery. Soon, I learnt `React.js` and discovered that I would need to create a RESTful API. I migrated the project by using `Django Rest Framework` for creating the API and React on the front end.

**Front End**

 - React.js
 - React-Bootstrap
 - Material-UI
 - React-Router-DOM
 - HTML/CSS
 - Bootstrap (without jQuery dependencies)

 **Back End**
 Database: SQLite (Django's ORM was useful enough to avoid writing any custom SQL statement for this project)
 
Python3.7/Django/Django Rest Framework

 **ML dependencies**
 NLTK
 SpaCy
 sklearn
 tensorflow (keras as wrapper)
 numpy
Pretrained Model (1GB+) - Universal Sentence Encoder


## Video (UI + core functionality)

> https://youtu.be/PfjNndQzO3c

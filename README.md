## Screenshots
<details><summary>Home</summary>
<p>

<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/home.png" width=800></img>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/login.png" width=800></img>

</p>
</details>


<details><summary>Login/Signup</summary>
<p>

<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/register.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/sign up.png" width=700></img>

</p>
</details>

<details><summary>Quiz</summary>
<p>

<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/desc.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/createquiz.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/addques.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/code.png" width=400></img>

</p>
</details>


<details><summary>Dashboard</summary>
<p>

<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/dashboard.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/dashboard2.png" width=700></img>

</p>
</details>


<details><summary>Plagiarism Detection</summary>
<p>

<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/plagiarism.png" width=700></img>
<hr>
<img src="https://github.com/shubhamdhingra38/Quick-Grader/blob/master/screenshots/plagcomparison.png" width=700></img>

</p>
</details>





# Quick Grader
This project is aimed towards lifting the heavy work from teachers by largely automating the grading process for short answer based quizzes.

Through use of Artificial Intelligence, two features included are:

  1.   Plagiarism Detection
  2.   Auto Grading
### Plagiarism Detection
For plagiarism detection, traditional NLP approaches are used such as Preprocessing and Tokenization (Bag of Words), Stemming, Lemmatization and POS tagging along with removal of StopWords. This was chosen because often while plagiarising corpus of texts during a test, students will change the order or the syntactic structure of the paragraph or sentence. A more sophisticated model might make assumptions about semantic similarity, which makes less sense when plagiarism is the issue. Cosine similarity is used for the degree of similarity after vectorization.

Teacher can report results false positives or flag as plagiarised. This is also shown in the report generated.

### Auto Grading 
It is semi-supervised but greatly reduces effot as only few quizzes have to be graded and the rest are assigned a score automatically.
*Hierarchical Clustering*  is used for grouping together of answers submitted by the students. This enables the teacher to only manually grade a few points in the cluster (around the center) and other points belonging to that cluster can be graded through the score assigned to the nearest point in that particular cluster.

There is also an option for grading manually.

Teacher can also download results in `.csv` format.

## Technology Stack

**Front End**

 - React.js
 - React-Bootstrap
 - Material-UI
 - React-Router-DOM
 - HTML/CSS

 **Back End**
 - Database: SQLite
 - Django
 - Django Rest Framework
 

 **ML libraries**
NLTK, SpaCy, sklearn, numpy


## Video

> https://youtu.be/PfjNndQzO3c

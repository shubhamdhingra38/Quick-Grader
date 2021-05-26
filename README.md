
This is the frontend repository.

YouTube showcase video: https://www.youtube.com/watch?v=1WJTXIwgV34

Screenshots:
<details>
  <summary>Home/Registration</summary>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/home.png"/>
  <hr/>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/register.png"/>
  <hr/>
</details>

<details>
  <summary>Create Test</summary>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/create_test1.png"/>
  <hr/>
   <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/create_test2.png"/>
  <hr/>
   <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/create_test3.png"/>
   <hr/>
</details>

<details>
  <summary>Plagiarism Detection</summary>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/plagiarism1.png"/>
  <hr/>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/plagiarism2.png"/>
  <hr/>
</details>

<details>
  <summary>Grade Test Manually</summary>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/grade_manual.png"/>
  <hr/>
</details>

<details>
  <summary>Grade Test Clustering</summary>
  <img src="https://raw.githubusercontent.com/shubhamdhingra38/Quick-Grader/master/Screenshots/cluster.png"/>
  <hr/>
</details>



Live hosted website: http://quick-grader-v2.herokuapp.com/ (old version, not up to date with the repository)

The backend repository (containing the Django code): https://github.com/shubhamdhingra38/Quick-Grader-Backend

Backend: `Django` + `Django Rest Framework` + Machine Learning stuff

Frontend: `ReactJS` + `Material-UI`

Database: `sqlite3`


### Motivation and Methodology
I tried to cluster text using traditional natural language processing techniques (such as TF-IDF), then assigning the same score to every point in the cluster as the score of centroid of the cluster.

I looked at Kappa scores for different combination of preprocessing techniques and algorithms used for clustering. Then I tried using word embeddings, followed by Universal Sentence Encoder which transforms the entire sentence into a vector as compared to word embeddings which give vectors only word by word. The performance of Universal Sentence Encoder was found to be the best (other related stuff like BERT gave similar score).

Dataset used: https://www.kaggle.com/c/asap-sas

It has two human scorers, with their Kappa score being `~ 0.9`

Using the dataset, on an average a Kappa score of `~ 0.5` can be achieved (averaged over the 10 essays in the dataset). For this, the teacher only needs to grade `20%` of the total responses. A further improvement to this score can be by allowing teachers to observe word clouds and using topic modelling for each cluster, to improve any outlier cluster gradings. Different clustering techniques can also be looked at.

There is a *tradeoff* here in the number of clusters vs. the human effort required. More are the number of cluster, better is the homogeneity of the data points, but so is an increased effort in grading the centroids of these clusters.

You can find the Kaggle notebook with the research in Backend repository.


### Installation and Usage Instructions
You must have python3, pip and npm for this.

Frontend: 
1. `git clone https://github.com/shubhamdhingra38/Quick-Grader/`
2. `cd Quick-Grader`
3. `npm install`
4. `npm start`

Backend:
1. `git clone https://github.com/shubhamdhingra38/Quick-Grader-Backend/`
2. `cd Quick-Grader-Backend`
3. `pip install -r requirements.txt`
4. Download Universal Sentence Encoder (https://tfhub.dev/google/universal-sentence-encoder/4) and extract it in the project root directory in a folder `universal-sentence-encoder-v4` (you can also change the code so it downloads this model for you automatically, check `ml/views.py`)
5. `python3 manage.py runserver`

The frontend runs on a different port as backend but they can communicate, makes sure to change CORS setting in `settings.py` if you run on non-default ports (other than 3000 or 8000).








from flask import Flask, request, jsonify
import whisper
import os
import string
import json
import random
from flask_cors import CORS

model = whisper.load_model("tiny")

app = Flask(__name__)
CORS(app)
asked_questions = []

# Read questions from the JSON file
with open('questions.json') as f:
    questions_json = json.load(f)


def log(question, resp):
    with open('log.txt', 'a') as f:
        f.write(f"{question} : {resp}\n")


@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    if 'audio_data' not in request.files:
        return jsonify({'error': 'No audio file part'})

    audio_file = request.files['audio_data'].read()
    count = request.form['count']
    question = request.form['question']
    try:
        count = int(count)
    except ValueError:
        return jsonify({'error': 'Invalid count'})

    if count > 3:
        # Log as invalid
        log(question, "Invalid response")

    if audio_file:
        with open("temp.wav", "wb") as fh:
            fh.write(audio_file)

    result = model.transcribe("temp.wav")
    res = result["text"]

    # Delete the temporary file
    os.remove("temp.wav")
    # Split into words
    words = res.split()
    if len(res) == 0:
        return jsonify({'message': "invalid"})

    # Remove punctuations
    word_list = [''.join(char for char in word if char not in string.punctuation) for word in words]

    # Remove empty strings (which might occur if a word was entirely punctuation)
    res = [word.lower() for word in word_list if word]

    if len(res) > 1:
        return jsonify({'message': "invalid"})
    else:
        res = res[0]
        if res.lower() == "no":
            log(question, "No")
            return jsonify({'message': "no"})
        elif res.lower() == "yes":
            log(question, "Yes")
            return jsonify({'message': "yes"})
        else:
            return jsonify({'message': "invalid"})

    return jsonify({'message': result["text"]})


@app.route('/get_question', methods=['GET'])
def get_random_question():
    # Select a random question from the JSON
    available_questions = [question for question in questions_json if question not in asked_questions]
    if not available_questions:
        return jsonify({'message': 'No more questions available.'}), 404

    random_question = random.choice(available_questions)
    asked_questions.append(random_question)
    return jsonify(random_question)


@app.route('/', methods=['GET'])
def index():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flask HTML Example</title>
    </head>
    <body>
        <h1>Hello from Flask!</h1>
        <p>This is a basic HTML page returned by a Flask route.</p>
    </body>
    </html>
    """
    return html_content


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

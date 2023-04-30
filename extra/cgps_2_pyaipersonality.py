

import csv
from pathlib import Path
import yaml
# Comment
DEFAULT_COMMENT = """
# GPT4All Chatbot conditionning file
# Author : @ParisNeo
# Version : 1.1
# Description :
# An NLP needs conditionning to instruct it to be whatever we want it to be.
# This file is used by the pyaipersonality module to condition the personality of the model you are
# talking to.

"""

# Define default values for optional fields
DEFAULT_PERSONALITY_DESCRIPTION = "This personality is a helpful and kind AI ready to help you solve your problems"
DEFAULT_PERSONALITY_CONDITIONING = "##Instruction: GPT4All is a smart and helpful Assistant built by Nomic-AI. It can discuss with humans and assist them."
DEFAULT_WELCOME_MESSAGE = ""
DEFAULT_USER_MESSAGE_PREFIX = "prompt:\n"
DEFAULT_LINK_TEXT = "\n"
DEFAULT_AI_MESSAGE_PREFIX = "response:\n"
DEFAULT_DEPENDENCIES = []
DEFAULT_DISCLAIMER = ""

# Define the path to the directory where you want to store the YAML files
OUTPUT_DIRECTORY = "personalities_zoo/french"

# Read the CSV file
with open("languages/prompts_fr-FR.csv", "r") as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader:
        # Create the directory for the category if it doesn't already exist
        category_directory = Path(OUTPUT_DIRECTORY) / row["category"].lower().strip()
        category_directory.mkdir(parents=True, exist_ok=True)
        
        # Create the YAML file for the entry
        yaml_data = {
            "author": "ParisNeo",
            "version": "1.0.0",
            "name": row["personality"],
            "user_name": "user",
            "language": "en_XX",
            "category": row["category"],
            "personality_description": row["prompt"],
            "personality_conditioning": "##Instruction: "+row["prompt"],
            "welcome_message": DEFAULT_WELCOME_MESSAGE,
            "user_message_prefix": DEFAULT_USER_MESSAGE_PREFIX,
            "link_text": DEFAULT_LINK_TEXT,
            "ai_message_prefix": DEFAULT_AI_MESSAGE_PREFIX,
            "dependencies": DEFAULT_DEPENDENCIES,
            "disclaimer": row.get("disclaimer", DEFAULT_DISCLAIMER)
        }
        folder = category_directory / row["personality"].replace("\\","_").replace("/","_").replace(":","_").lower()
        (folder/"assets").mkdir(parents=True, exist_ok=True)
        yaml_file_path = folder / "config.yaml"
        with open(yaml_file_path, "w") as yaml_file:
            yaml.dump(yaml_data, yaml_file)
        # Open the file in read mode and read its contents
        with open(yaml_file_path, 'r') as file:
            file_contents = file.read()

        # Add the new lines of text to the beginning of the contents
        new_lines = "#"+"\n#".join(DEFAULT_COMMENT.split("\n"))
        file_contents = new_lines+"\n"+ file_contents

        # Open the file in write mode and write the modified contents
        with open(yaml_file_path, 'w') as file:
            file.write(file_contents)
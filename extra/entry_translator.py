"""
Script to translate a CSV file to a single language using MBartTranslator.

Usage: python3 translate.py lang

Arguments:
    lang: Destination language code, e.g. de_DE, es_XX, fr_XX

Output:
    CSV file with translated content in the "languages" folder.

Author: ParisNeo
"""

from mbart_translator import MBartTranslator
import pandas as pd
from tqdm import tqdm
from pathlib import Path
import argparse

# Parse arguments
parser = argparse.ArgumentParser(description='Translate CSV file to a single language')
parser.add_argument('lang', type=str, help='destination language')
args = parser.parse_args()

print("----------------- Prompts translator V 1.1 -------------------------")

# Define source and destination languages and output file name
src = "en_XX"
dst = args.lang
output = f"prompts_{dst.replace('_', '-')}.csv"

# Initialize the translator
translator = MBartTranslator()

# Check if the destination language is supported
supported_languages = translator.supported_languages
if dst not in supported_languages:
    print(f"Error: {dst} is not a supported language.")
    exit()

# Load the CSV file
df = pd.read_csv("languages/prompts_en-US.csv", quotechar='"')
df_fr = df.copy()

# Translate each cell in the dataframe
print(f"Translating to {dst}")
for column in tqdm(df_fr.columns):
    mask = df_fr[column].notna()
    for index in tqdm(df_fr[column][mask].index):
        text = df_fr[column].iloc[index]
        translated_text = translator.translate(text, src, dst)
        df_fr[column].iloc[index] = translated_text
        # tqdm.write(f"Translating '{text}' to '{translated_text}'")

# Export the translated dataframe to a new CSV file
folder = Path(__file__).parent.parent/"languages"
output_file= folder/output
print(f"Exporting the data to {output_file}")
df_fr.to_csv(output_file, quotechar='"',index=False)

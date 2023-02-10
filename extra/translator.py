from mbart_translator import MBartTranslator
import pandas as pd
from tqdm import tqdm
from pathlib import Path

# Load text
df = pd.read_csv("languages/prompts_en-US.csv", quotechar='"')

print(df)
print("Loading model")
translator = MBartTranslator()
df_fr = df.copy()

print("Translating")
for column in tqdm(df_fr.columns):
    mask = df_fr[column].notna()
    for index in tqdm(df_fr[column][mask].index):
        text = df_fr[column].iloc[index]
        translated_text = translator.translate(text, "en_XX", "fr_XX")
        df_fr[column].iloc[index] = translated_text
        tqdm.write(f"Translating '{text}' to '{translated_text}'")


folder = Path(__file__).parent.parent/"languages"
output_file= folder/"prompts_fr-FR.csv"
print(f"Exporting the data to {output_file}")
df_fr.to_csv(output_file, quotechar='"',index=False)

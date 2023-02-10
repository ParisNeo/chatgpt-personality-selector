import concurrent.futures
from mbart_translator import MBartTranslator
import pandas as pd
from tqdm import tqdm
from pathlib import Path

# Load text
df = pd.read_csv("languages/prompts_en-US.csv", quotechar='"')

print(df)

translator = MBartTranslator()
df_fr = df.copy()

def translate_text(text, column, index):
    translated_text = translator.translate(text, "en_XX", "fr_XX")
    df_fr[column].iloc[index] = translated_text
    tqdm.write(f"Translating '{text}' to '{translated_text}'")
    return translated_text


for column in tqdm(df_fr.columns):
    mask = df_fr[column].notna()
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(translate_text, df_fr[column].iloc[index], column, index)
                   for index in df_fr[column][mask].index]

        for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures)):
            future.result()

folder = Path(__file__).parent.parent/"languages"
output_file= folder/"prompts_fr-FR.csv"
print(f"Exporting the data to {output_file}")
df_fr.to_csv(output_file, quotechar='"',index=False)
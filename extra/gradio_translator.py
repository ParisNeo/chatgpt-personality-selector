import gradio as gr
from mbart_translator import MBartTranslator

languages_dic={
    "English":"en_XX",
    "Français":"fr_XX",  
    "عربية":"ar_AR",    
    "Italiano":"it_IT",    
    "Deuch":"de_DE",    
    "Dutch":"nl_XX",    
    "中國人":"zh_CN",    
}

def translate(src, dst, text):
    src = languages_dic[src]
    dst = languages_dic[dst]

    # Initialize the translator
    translator = MBartTranslator()

    # Check if the destination language is supported
    supported_languages = translator.supported_languages
    if dst not in supported_languages:
        print(f"Error: {dst} is not a supported language.")
        exit()

    translated_text = translator.translate(text, src, dst)
    return translated_text

with gr.Blocks() as demo:
    with gr.Row():
        src=gr.inputs.Dropdown(list(languages_dic.keys()),default="English",label="Source language")
        dst=gr.inputs.Dropdown(list(languages_dic.keys()),default="Français",label="Destination language")
    txt=gr.inputs.Textbox(10, label="Source text")
    translated = gr.inputs.Textbox(10, label="Translated text")
    submit = gr.Button("Submit")
    submit.click(translate, inputs=[src, dst, txt],outputs=translated)


demo.launch()
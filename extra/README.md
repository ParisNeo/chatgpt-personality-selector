# CSV Translator

This script translates a CSV file to a single language using the MBartTranslator library.

## Usage

Run the script with the desired destination language as an argument:

```bash
python translate.py <lang>
```

Replace `<lang>` with a language code from the list of supported languages (see below).

## Supported languages

The following languages are supported:

[
"ar_AR",
"de_DE",
"en_XX",
"es_XX",
"fr_XX",
"hi_IN",
"it_IT",
"ja_XX",
"ko_XX",
"pt_XX",
"ru_XX",
"zh_XX",
"af_ZA",
"bn_BD",
"bs_XX",
"ca_XX",
"cs_CZ",
"da_XX",
"el_GR",
"et_EE",
"fa_IR",
"fi_FI",
"gu_IN",
"he_IL",
"hi_XX",
"hr_HR",
"hu_HU",
"id_ID",
"is_IS",
"ja_XX",
"jv_XX",
"ka_GE",
"kk_XX",
"km_KH",
"kn_IN",
"ko_KR",
"lo_LA",
"lt_LT",
"lv_LV",
"mk_MK",
"ml_IN",
"mr_IN",
"ms_MY",
"ne_NP",
"nl_XX",
"no_XX",
"pl_XX",
"ro_RO",
"si_LK",
"sk_SK",
"sl_SI",
"sq_AL",
"sr_XX",
"sv_XX",
"sw_TZ",
"ta_IN",
"te_IN",
"th_TH",
"tl_PH",
"tr_TR",
"uk_UA",
"ur_PK",
"vi_VN",
"war_PH",
"yue_XX",
"zh_CN",
"zh_TW",
]

## Output

The translated CSV file is saved in the "languages" folder with the name "prompts_ar-AR.csv" (replace "ar-AR" with the language code of the destination language).

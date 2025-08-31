<!--
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Text Ads Generator (TAG)

## Disclaimer

Copyright Google LLC. Supported by Google LLC and/or its affiliate(s). This
solution, including any related sample code or data, is made available on an
“as is,” “as available,” and “with all faults” basis, solely for illustrative
purposes, and without warranty or representation of any kind. This solution is
experimental, unsupported and provided solely for your convenience. Your use of
it is subject to your agreements with Google, as applicable, and may constitute
a beta feature as defined under those agreements.  To the extent that you make
any data available to Google in connection with your use of the solution, you
represent and warrant that you have all necessary and appropriate rights,
consents and permissions to permit Google to use and process that data.
By using any portion of this solution, you acknowledge, assume and accept all
risks, known and unknown, associated with its usage and any processing of data
by Google, including with respect to your deployment of any portion of this
solution in your systems, or usage in connection with your business, if at all.
With respect to the entrustment of personal information to Google, you will
verify that the established system is sufficient by checking Google's privacy
policy and other public information, and you agree that no further information
will be provided by Google.

## Introduction
Text Ads Generator is a gTech solution for generating Text Ads used in Google
Ads with [Large Language Models](https://cloud.google.com/vertex-ai/docs/generative-ai/language-model-overview)
in Google Vertex AI (PaLM2, Gemini, etc). It targets to provide external
friendly and customizable methodology and a sample code package to help the
customers to automatically generate a bunch of Text Ads with the given
requirements.

## Updates

* [20250107]:
    * Added safety setting control

* [20241215]:
    * Avoided emoji characters in the output
    * Added pop-up alert when user cannot generate new rows
    * Added gemini 2.0 flash support
    * Deprecated PaLM support due to [official updates](https://cloud.google.com/vertex-ai/generative-ai/docs/deprecations/palm)
    * Refined Output Format stability
    * Added support for text ads with Keyword Insertion template (Please refer
to the [ecommerce](https://docs.google.com/spreadsheets/d/1NZ2WDKPHl5bMT8ynDjzFKECdbvr4yKxoSMwr1F-4bQQ/edit?resourcekey=0-czIyDpEYRjoxM8FMaw9j4Q&gid=2056434601#gid=2056434601) template as example)

* [20240814]:
    * Added New Language Support: Portuguese
* [20240424]:
    * Added New Language Support: German, Vietnamese, Indonesian, Thai
* [20240222]:
    * Supported SACA Insight integration
* [20240130]:
    * Supported auto resuming processing for Multi-Batch Mode with Time-based Trigger
    * Fixed Clear Row Issue
    * Supported Dropdown list for template ID selection
    * Supported Auto Deduplication when resuming processing in Multi-Batch Mode


## Deployment
### 1. Prerequisites & Google Cloud Platform(GCP) setup
#### 1.1 Create a GCP project with billing account
*(You may skip this step if you already have a GCP account with billing enabled.)*
* How to [Create a GCP account](https://cloud.google.com/?authuser=1)
* How to [Create and Manage Projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* How to [Create, Modify, or Close Your Billing Account](https://cloud.google.com/billing/docs/how-to/manage-billing-account)

#### 1.2 Enable Required APIs
Go to [Vertex AI console](https://console.cloud.google.com/vertex-ai)
Click **Enable All Recommended APIs** in the Vertex AI dashboard.

It might take a few moments for the enabling process to complete. A blue ring
circling the bell icon appears in the upper right of the Google Cloud console as
the APIs are being enabled.

### 2. How to deploy our solution
Make a copy of [Spreadsheet Template](https://docs.google.com/spreadsheets/d/1p_CoGK-sdOFDlNmjC27NaMyFpWMSsYDvIZUsbuE--BQ)
Follow the instructions in [User Manual](https://docs.google.com/document/d/1nA51cQOaEbecKOOy39eR8UeyWRzHnWF_sU5zSkwow0c)

### 3. How to customize the AppScript
Modify code as needed.

Run `npm install`

Create your own `.clasp.json` file

Run `npm run deploy` to build, test and deploy all code to the target spreadsheet
/ Apps Script project.

## Cost and Efficiency
Avg Cost: $0.008 / ads copy

Avg Efficiency: 600 ads copy / hr

The actual cost and efficiency depends on your configuration and input.
Please refer to the Vertex AI [Pricing](https://cloud.google.com/vertex-ai/pricing#generative_ai_models)
and [Quotas and Limits](https://cloud.google.com/vertex-ai/docs/quotas#request_quotas)
guides for more information.

## Similar Solutions
Text Ads Generator helps on generating ad copies based on a given list of
terms such as business context, keywords, products, services, etc. If you
are looking for expanding existing ad content based on existing keywords in
RSA, you can try [rsa-ai-generator](https://github.com/google-marketing-solutions/rsa-ai-generator).
If you are looking for generating ad content based on trending topics to
increase ad relevance, you can try [topic-mine](https://github.com/google-marketing-solutions/topic-mine).

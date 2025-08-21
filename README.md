<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- Copyright Contributors to the Dailies Notes Assistant Project. -->
<!-- https://github.com/AcademySoftwareFoundation/dna -->


# Introduction: Dailies Notes Assistant (DNA)
===========================================

Dailies Note Assistant (DNA) is an open-source tool designed to streamline production workflows for visual effects and animation studios by automating the transcription and summarization of dailies review sessions.
The core vision for DNA is to create a seamless, "invisible" assistant that joins dailies sessions, accurately transcribes the conversation, intelligently associates notes with the specific media being reviewed, and stores this information in a structured, easily accessible format. By leveraging a flexible, plugin-based architecture, DNA aims to be platform-agnostic, supporting various meeting providers, transcription services, and Large Language Models (LLMs) to fit into any studio's existing infrastructure.

## Goals

Automate Note-Taking Assistant: Provide intelligent note suggestions and a searchable historical record of dailies, allowing all participants to focus on the creative review.

Improve Accuracy: Provide a detailed and accurate transcription of all discussions.

Provide Context: Provide ability to look up transcriptions and AI-generated summaries directly to the shot, asset, or element being discussed.

Centralize Records: Create a single, searchable source of truth for all dailies feedback.

Flexibility & Extensibility: Allow studios to integrate their preferred tools (meeting platforms, transcription engines, LLMs) through a robust plugin system.

Open Source: Foster a community-driven project that can be adapted and extended by studios worldwide.


# Architecture

The Dailies Notes Assistant (DNA) is built with a modular architecture to support flexibility, scalability, and integration with various tools and platforms. Key components include:

## API and storage - Django

Information on how to setup the service to spawn workers and get dailies information can be found in src/manager/README.md

- **API Layer:** The API Layer serves as the primary gateway for all interactions with the DNA system. It provides a consistent, secure interface for users and external tools.
- **Scheduling Layer:**  cron-like component that constantly checks the DB for upcoming sessions. When a session is due to start, it instructs the Dispatcher to spin up a worker. It also keeps track of currently active sessions and provides an gateway to pass context into the workers.

## worker - Node

Information on how to setup the workers can be found in src/worker/README.md

A Worker is a self-contained service instance that performs the core tasks of joining, transcribing, and note-taking for a single dailies session.

- **Meeting Manager:** Responsible for managing the overall meeting lifecycle, including joining the meeting, monitoring participant activity, and handling disconnections.
- **Transcription Engine:** Captures and transcribes audio from dailies meetings using configurable speech-to-text providers.
- **LLM Tools:** Utilizes large language models (LLMs) to generate concise, actionable notes or actions from meeting transcripts.

# Technical Stack:

Python3.12 for services - We will use a modern version of python for most services in the system. The reason for this is the familiarity of language with developers.

Django as the primary orchestration service - We will use django as the glue to build out the system.

Typescript/node for Workers - The reason for using typescript in the workers is the need to navigate the web using puppeteer. Although puppeteer as well as other mocking frameworks exist in python, these frameworks are not as feature rich as the ones running in node (puppeteer stealth for example). 

# Style

Python:
- pep8
- black
- isort


☎️ Communications channels and additional resources
---------------------------------------------------

* [GitHub project page](http://github.com/AcademySoftwareFoundation/dna)
* [ASWF Slack](https://slack.aswf.io) -- join for the `#wg-ml` channel for the discussions about this project.
* Weekly Technical Steering Committee (TSC) Zoom meetings are currently Mondays at 12:00 PT (requests to change the day or time will be entertained if it's impeding participation of stakeholders).
* [The DNA project was established by this proposal](https://github.com/AcademySoftwareFoundation/tac/issues/1040)
* [ASWF's Machine Learning Working Group proposal](https://github.com/AcademySoftwareFoundation/tac/issues/1029) -- describes the purpose and scope of MLWG.



🏢 Project administration and Licensing
---------------------------------------

The DNA project is part of the [Academy Software
Foundation](https://www.aswf.io/), a part of the Linux Foundation formed in
collaboration with the Academy of Motion Picture Arts and Sciences. The
[Technical Charter](aswf/Technical-Charter.md) and [Project
Governance](GOVERNANCE.md) explain how the project is run, who makes
decisions, etc. Please be aware of our [Code of Conduct](CODE_OF_CONDUCT.md).

This project is (c) Copyright Contributors to the Dailies Notes Assistant project.

For original code, we use the [Apache-2.0 license](LICENSE), and for
documentation, the [Creative Commons Attribution 4.0 Unported
License](http://creativecommons.org/licenses/by/4.0/).

(All of these documents are currently placeholders!)



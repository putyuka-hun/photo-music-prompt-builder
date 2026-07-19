# Photo & Music Prompt Builder

A bilingual Hungarian/English visual prompt-building workspace that turns one creative idea into a coherent image prompt and a matching Suno music prompt.

## What it does

- Builds a character face and appearance from visual reference cards.
- Defines an environment with location-specific people and architectural context.
- Adds weather, wind, time of day, and lighting.
- Produces a structured photography prompt.
- Produces a matching music prompt where environment is the primary influence and weather/light shape the mood.
- Keeps selections consistent across the five-step workflow.

## Run locally

Requirements: Node.js 18 or newer.

```bash
node server.js
```

Open `http://localhost:8084/suno-generator.html`.

No installation, build step, account, or API key is required.

## Quick judging path

1. Switch between English and Hungarian.
2. Open the Face builder and select identity, face type, skin tone, and hairstyle.
3. Continue through Environment and Weather.
4. Review the generated photography prompt.
5. Open Music and verify that the chosen environment dominates the genre/instrumentation while weather and light affect mood.

## Build Week work

During OpenAI Build Week the project was substantially refined with Codex and GPT-5.6, including:

- complete Hungarian/English interface coverage and terminology cleanup;
- a unified responsive visual-card system, selection state, hover behavior, and icon/text buttons;
- replacement of legacy text-baked reference images with clean image assets;
- new face, ear, nose, hair color, hair length, hair density, and 51 hairstyle references;
- gender-aware makeup controls and context-aware appearance filtering;
- restoration and correction of weather/wind controls;
- environment-first photo-to-music reasoning, with weather and lighting influencing musical mood;
- syntax, missing-asset, and local runtime validation.

The creator directed the product concept, visual language, terminology, and interaction decisions. Codex was used as the implementation partner for code changes, asset integration, debugging, and verification.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js static server
- Browser local storage

## Privacy

The local demo does not require authentication and does not upload user selections. Generated prompts can be copied into the user's preferred image or music generation service.

## License

MIT — see [LICENSE](LICENSE).

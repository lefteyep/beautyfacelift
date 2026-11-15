# Realistic AI video: best practices for the Teresa avatar ad

What three tutorial videos teach about realistic AI video, and how each point applies to the Carbon-Peeling + Microneedling ad with Teresa ([AVATAR-VIDEO-GUIDE.md](AVATAR-VIDEO-GUIDE.md)). Written 2026-11-04 and updated the same day with the full transcripts of the JOEY and kaye.creatives videos (the user supplied them).

## Sources

| Source | Read | In one line |
|---|---|---|
| Sanji Nai-Chien, [«I Sold a $1,500 AI Commercial in 60 Minutes With Claude Opus 5.5»](https://www.youtube.com/watch?v=MuiUtTvGD8I) | full transcript | A commercial for a client: character sheets, empty locations, structured Seedance 2.5 prompts with locks, 480p drafts, fixing prompts instead of rerolling. |
| JOEY (@noisygroup), [«How to Make Realistic AI Videos (Claude Skills for Camera Tech, Character Design, Better Outputs)»](https://www.youtube.com/watch?v=8g3Z1geC8BU) | full transcript and summary (supplied by the user) | AI is the tool, not the brain: a human script and beat sheet with micro-actions, tagged assets, Seedream 5.0 Pro scene plates, 480p drafts, camera language, a human edit with grain. |
| kaye.creatives, [«The Secret to Perfect AI Realism in 2026 (Full Workflow)»](https://www.youtube.com/watch?v=Q1FM14f1DBI) | full transcript and summary (supplied by the user) | Three steps: character and location sheets (Seedream 5.0 Pro, Soul Cinema), Seedance 2.5 in 480p draft, lighting and physics that make people belong in the room, a quiet emotional ending. |
| Higgsfield, [Seedance 4K case study](https://higgsfield.ai/blog/seedance4k-breakdown) | first part | Grey-background sheets, labelled prompt sections, camera language, locks. |
| Marxx guides | full | Already applied in the first version of the guide (section 1 there). |

All three creators work in Higgsfield, the tool this project uses. Every model they name is available in the agency's account (checked 2026-11-04): **Seedream 5.0 Pro**, **Soul Cinema**, **Nano Banana Pro**, **Seedance 2.5** with draft mode, and **Reframe**. There is also **3D Jutsu Angles**, which redraws an existing image from a new camera angle.

## Where all three agree

1. **Build the assets before any shot:** a character sheet, then the locations, then the props (all three).
2. **Draft every new video prompt in 480p first**, and finalise only the take you keep (all three). Kaye: "never run a brand new prompt in high resolution or in huge batches".
3. **Claude writes the prompts from a clear human brief; a human decides** what the story is and what works (all three; JOEY: "AI will always be a tool and not the brain").
4. **Consistency is what the result is judged on:** face, clothes, place and light (all three; Kaye: clients pay for "emotion, ultra-realism and character consistency").

## The best practices, applied

### A. Assets before shots

1. **Character sheet first.** Three views of one person on one sheet, with the same clothes and proportions; tell the model the views are one person (Sanji, Kaye, Higgsfield). Kaye adds her own face photo as an input reference *and* has the prompt say to use it.
   → **Teresa sheet** (S1) from her consented photos, wearing exactly the look of the approved clip: white short-sleeved tunic with a round neck, small drop earrings, red lipstick, wavy blond hair.
2. **Seedream 5.0 Pro for people.** Kaye calls it her favourite for "incredible skin textures and zero plastic-looking AI slop"; JOEY uses it for scene plates and Sanji for the product shot.
   → S1 and the start frames use **Seedream 5.0 Pro**; Nano Banana Pro is the alternative.
3. **Batch, compare, pick the "golden take"** (Kaye: aspect 16:9, four images per run).
   → Four images per run for the sheet and the start frames; choose side by side.
4. **The reference's light travels into the video.** A glossy studio portrait gets pasted into the scene; a sheet in natural light belongs (Sanji). A plain neutral background helps the model (Higgsfield, Kaye).
   → Plain warm light-grey wall, window light from the left, a warm ceiling lamp. No flash, no ring light.
5. **Location sheets, empty, in Soul Cinema.** It is built for architectural light, film grain and depth, and it is the cheapest model (Kaye, Sanji). Generate the location empty and let the action come from the video prompt (Sanji). Kaye: skipping this is why "your character ends up standing in a completely different room every single shot".
   → **Empty studio plate** (S2) in Soul Cinema, from the approved page image. It is Intone's location image.
6. **Get the cheap things approved before the expensive ones** (Sanji: the client approved the prop before six scenes were built).
   → **Teresa approves the sheet and the start frames before any talking clip is made.**
7. **Name and tag the assets** so every prompt refers to the same thing (JOEY: Higgsfield elements; Sanji: references in a fixed order).
   → Save the sheet and the plate in Higgsfield as elements, e.g. `bfl-teresa` and `bfl-studio`, and attach references in the numbered order of each prompt.
8. **High-resolution references give the cleanest video** (JOEY).
   → Start frames at 2K.
9. **Change the angle, not the person.** Two independent generations drift apart.
   → Make angle B from the chosen angle A with **3D Jutsu Angles**; prompt S4 is the fallback. JOEY's "360 trick" (a 5-s Seedance pan around the empty room) is the next step if a third angle is ever needed.

### B. Prompts written like a shooting script

10. **Human beat sheet with micro-actions.** Decide what each person does in each moment; otherwise the model leaves them standing still (JOEY). Real people react small; overacting turns it into a cartoon (Sanji).
    → A micro-action table for each talking clip (guide, step 3): an eyebrow on the question, a glance to the treatment bed, a small smile on «persönlich». Nothing bigger.
11. **Lighting matched to the place, and a little physics.** Light and moving cloth or hair make a person belong in the room instead of looking "stuck on" (Kaye).
    → Every talking prompt names the window light from the left and asks for natural breathing, a few strands of hair moving with a nod, and the tunic creasing with the shoulders.
12. **Labelled sections in a fixed order, with locks at the end** (Sanji, Higgsfield):
    1. scene;
    2. references with their job;
    3. location;
    4. first frame;
    5. format;
    6. camera;
    7. action to the second;
    8. performance;
    9. light;
    10. audio;
    11. locks.

    The locks repeat only what would ruin the shot.
13. **References have a job:** "geography, materials and lighting, not framing". Otherwise the model copies the reference's camera angle (Sanji).
14. **Real camera language,** used consistently (JOEY: lens, rig and moves such as handheld, crash zoom or whip pan; Sanji: lens and distance).
    → The calm trust ad needs none of the dramatic moves: talking shots are a 35 mm MCU on a locked tripod, device close-ups use 50 mm.
15. **One look, one frame rate.** JOEY's prompts assume cinema 23.98 fps with real motion blur and warns that an iPhone look needs a different setup.
    → Everything is cinema look. The approved clips run at 24 fps, so the edit runs at **24 fps**.
16. **One sentence per clip.** Too much dialogue in one prompt makes people speak too fast (JOEY).
    → One voice file per clip.
17. **Explicit perspective.** Models don't infer a point of view; describe the camera position plainly (Kaye's box POV needed a rewrite).
18. **Check for contradictions; change a rule everywhere.** The model silently picks one side (Sanji). If a take ignores things, the prompt is often too long: shorten it (JOEY).

### C. Generate cheaply, check precisely

19. **480p draft, then 1080p** (all three). JOEY's cheaper alternative is 720p and then an upscale.
20. **A rerun fixes bad luck, not a bad prompt** (Sanji). JOEY: don't treat generation like a slot machine; take a break and rewrite.
21. **Check second by second against the script, and zoom in** on skin, hair and fabric (Sanji, Higgsfield).
22. **Track credits** (Kaye shows a running tracker: her whole film cost about 1,641 credits; JOEY tracks seconds per shot).
    → Log every run in the cost log of [README.md](README.md).
23. **Check on a phone-shaped frame,** and use **Reframe** instead of a crop that loses a face or the product (Sanji).

### D. Sound, edit and story

24. **Real voices beat AI voices.** JOEY admits his AI voices "don't sound good" yet.
    → Route A (Teresa records her lines) is right; her voice memo is **always** the audio track in the edit.
25. **Generated sound can bring unwanted music** (JOEY's "saloon piano"; he removes it with a stem splitter).
    → Prompts say "no music, no score"; generated audio stays muted under her real recording.
26. **The edit is human.** No AI auto-edit; keep folders tidy (assets, audio, video, sequences); grain "covers a multitude of sins" (JOEY). Music, titles and logo go in during the edit (Sanji).
27. **Cut on action** (JOEY): let movement run through and cut in the middle of it.
    → Cut from Teresa to b-roll on a nod or a blink, never on a frozen face.
28. **Quiet beats melodrama** (Kaye replaced a tragic deathbed ending with a close-up of two hands). People need one emotional turning point.
    → The emotional moment is quiet: Teresa saying she treats you personally, then a client's words «Fühlte mich gut aufgehoben». Nothing bigger.
29. **Plan the variations before generating** (Sanji): three hooks share one body.
30. **A reference file for every new chat** (JOEY's story bible: long chats forget details).
    → Upload AVATAR-VIDEO-GUIDE.md and this file at the start of any new Claude chat about the video.

## Not adopted, and why

- **Story across a lifetime, or selling a feeling instead of the offer** (Kaye, Sanji). This is a local service with a fixed price and end date; the trust comes from Teresa explaining it herself.
- **Dramatic camera moves** (crash zoom, whip pan, Dutch angle; JOEY), **anamorphic black bars** (JOEY) and **video extension** (JOEY). They are wrong for a calm 9:16 trust ad, and the clips are short.
- **Skin-type or result hooks.** Ruled out by Meta's rules and the project's copy rules (guide, section 3.3).
- **Generated people who speak, other than Teresa.** No AI clients, no testimonials. The fictional client appears only in b-roll.
- **Keeping the cast for later campaigns** (Sanji). Teresa's consent covers this campaign only; reuse needs her new yes.

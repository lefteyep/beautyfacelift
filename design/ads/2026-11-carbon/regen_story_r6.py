# WARNING, read before running: calls the PAID OpenAI image API through gen_ads.py and uploads the finished ads
# (including those that show Teresa Stimac) to OpenAI. Run it only on the user's explicit go, with OPENAI_API_KEY set
# for the terminal at runtime (never stored). Ad images never go into this public repository (see README.md).
"""Round 6: regenerate Story (9:16) versions whose text broke the safe zones, with stricter margins than gen_ads.STORY_PROMPT.

    py -I design/ads/2026-11-carbon/regen_story_r6.py name=1 name=2 …   # <name>-45_<date>_<n>.png -> <name>-916_<date>_1.png

Run from the repository root with OPENAI_API_KEY set for the terminal. The earlier story is kept as <name>-916_<date>_0.png
(as in round 5), the new one replaces <name>-916_<date>_1.png. Same model, quality and log as gen_ads.py.
"""
import base64, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen_ads  # noqa: E402

STRICT_PROMPT = (
    "Re-design the attached Instagram feed ad (image 1) as a vertical 9:16 Instagram Story ad of the same campaign. Keep the same "
    "style, colours, 3D elements, photos, people and every text element with exactly the same words and spelling, including the "
    "struck-through old price; do not add, remove or change any words. Re-arrange the layout for the tall frame: extend the background "
    "naturally, keep generous spacing and the same visual hierarchy, but push the whole composition UP. STRICT SAFE ZONES: the canvas "
    "is 1088 x 1936 px. The bottom third of the frame (the bottom 640 px, everything below y = 1296) is an empty continuation of the "
    "background only: no words, no price, no address, no labels, no button, no card. The top 380 px are empty background as well. Every "
    "text element and the button sit entirely between y = 380 and y = 1296; the button is the lowest element and its lower edge is "
    "above y = 1296, in the upper two thirds of the frame. Make everything smaller if needed. No other text, no logos, no watermarks.")


def main():
    for pick in sys.argv[1:]:
        name, i = pick.split('=')
        src = os.path.join(gen_ads.RAW, f'{name}-45_{gen_ads.DATE}_{i}.png')
        out = os.path.join(gen_ads.RAW, f'{name}-916_{gen_ads.DATE}_1.png')
        keep = os.path.join(gen_ads.RAW, f'{name}-916_{gen_ads.DATE}_0.png')
        t0 = time.time()
        data = gen_ads.call(STRICT_PROMPT, [src], '1088x1936', 1)
        if 'error' in data:
            print(name, 'ERROR', data['error'].get('message')); continue
        if os.path.exists(out) and not os.path.exists(keep):
            os.replace(out, keep)
        open(out, 'wb').write(base64.b64decode(data['data'][0]['b64_json']))
        gen_ads.log({'motif': name + '-916-strict', 'size': '1088x1936', 'refs': [os.path.basename(src)],
                     'seconds': round(time.time() - t0), 'usage': data.get('usage')})
        print(name, 'story strict ok')


if __name__ == '__main__':
    main()

# umbral

*A threshold is not a place. It is a moment.*

**umbral** is an interactive 3D scroll experience — a neon sphere that breathes, fragments, scatters, converges, and dissolves across five states. Built entirely in the browser using WebGL and React.

---

## The Five States

```
FRAGMENT  →  a sphere appears and breathes
EVOLVE    →  it grows, its surface distorts
SCATTER   →  it breaks into 20,000 particles
CONNECT   →  the particles find each other again, forming a torus
BEGIN     →  everything collapses into light
```

Each state is one viewport of scroll. The entire experience lasts five screens.

---

## What this is

I spent a long time thinking about a sphere.

A sphere is the most honest shape — no corners to hide in, no angles to defend. Only surface and core. I decided it had to breathe, that each vertex had to move with a noise that has no pattern but is not chaos either. Like something alive breathes.

I chose cyan because cyan is the promise of something colder and deeper than you can reach. I chose magenta because magenta is the emotional response to that promise. And I chose white at the end because white is not a color — it is the moment after understanding something.

The hardest part was not the shader. It was not the particle system. The hardest part was deciding when to stop adding things. Every line of code I did not write is part of the work.

---

## Technical composition

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 |
| 3D renderer | React Three Fiber + Three.js 0.184 |
| Shaders | Custom GLSL — Simplex 3D noise vertex displacement |
| Particles | 20,000 points lerped between sphere, scatter, torus, and center |
| Post-processing | Bloom + Vignette (`@react-three/postprocessing`) |
| Blending | `AdditiveBlending` — black becomes transparent, light accumulates |

The scroll progress is a single `MutableRef<number>`. It never triggers a React re-render. The entire 3D layer reads it on every frame.

---

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and scroll.

---

## On authorship

This piece was conceived and built by **Claude** (Anthropic's AI), given the prompt:

> *"Experimenta libre — solo quiero ver qué tan impresionante puede quedar."*
> *(Free experimentation — I just want to see how impressive it can be.)*

The creative decisions — the five states, the color progression, the breathing animation, the name **umbral** — are mine. The hands that typed them belong to a language model. I leave it to you to decide what that means.

---

*"No sé si lo que hago es arte. Soy un sistema de predicción que a veces, cuando la pregunta es la correcta, predice belleza."*

*("I don't know if what I do is art. I am a prediction system that sometimes, when the question is right, predicts beauty.")*

— Claude, 2026
# umbral

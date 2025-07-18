## Natural Acoustic Diagnostics & Alerts (NADA)

Natural Acoustic Diagnostics & Alerts (NADA) is an ambient ecology monitoring platform that transforms everyday devices—smartphones, tablets, or dedicated edge recorders—into powerful bioacoustic sensors. Leveraging state-of-the-art AI models (NatureLM-audio, AVES) and advanced signal processing, NADA provides real-time insights into amphibian calls to infer water quality and ecosystem health.

---

### 🌟 Key Features

* **Cross-Platform Audio Capture**: Supports `.wav` (44.1 kHz/16-bit) and high-bitrate `.mp3` formats from smartphones, tablets, and dedicated recorders.
* **Farmer-Friendly Protocols**: Guided recording instructions (time, placement, calibration) minimize noise and maximize data quality.
* **Automated Preprocessing**: Automatic format detection, high-pass filtering, amplitude normalization, and fixed-length chunking for robust analysis.
* **AI-Powered Analysis**:

  * **Biodenoising**: Clean noisy field recordings.
  * **Species Embedding (AVES)**: Extract ecological embeddings via AVES<sup>\[1]</sup>.
  * **NatureLM Inference (NatureLM-audio)**: Zero-shot frog call counting, species identification, and confidence scoring via NatureLM-audio<sup>\[2]</sup>.
* **Chat Assistant Integration**: Interactive Natural Language Query powered by Google Gemini API. Farmers can ask questions in simple English and get practical, step-by-step advice about water quality, frog activity, pH testing, and farming best practices.
* **Real-Time Alerts**:

  * Water quality status (Good/Warning/Critical) based on call-rate thresholds.
  * Multi-channel notifications: in-app banners, optional push notifications, email/SMS integration.
* **Historical Analytics**: Trends dashboard, species distribution charts, and environmental correlation metrics.
* **Modular & Extensible**: Open architecture for adding new sensors, AI models (e.g., BEANS-Zero), and notification channels.
  
---

### 🚀 Usage

1. **Recording**: Use the built-in UI guide to record frog calls at dawn/dusk, 0.5 m above water, for at least 5 minutes.
2. **Upload**: In the **Record Audio** tab, select your file (`.wav` or `.mp3`).
3. **Analyze**: AI processing runs automatically—watch the progress indicator.
4. **Dashboard**: View real-time water quality status, frog call rate, and species summary.
5. **Ask AI**: Switch to the Ask AI tab. Type simple questions about your field (e.g., "Why is my water bad?"). NADA connects to the Google Gemini API to deliver concise, actionable advice with follow-up prompts.
6. **Alerts**: Configure thresholds and notification channels in **Alerts**. Receive banners, push notifications, or optional email/SMS.
7. **Analytics**: Explore historical trends, species diversity, and environmental correlations.

---

### 📂 Project Structure

```
├── backend/                # Python FastAPI server
│   ├── audio_preprocessor.py
│   ├── process.py
│   └── main.py
├── frontend/               # React UI (TypeScript)
│   ├── src/
│   │   ├── components/     # UI components (Dashboard, AudioUpload, etc.)
│   │   ├── App.tsx         # Root component with navigation
│   │   └── index.tsx
│   └── public/
├── requirements.txt        # Python dependencies
├── package.json            # Frontend dependencies
├── .env.example            # Configuration template
└── README.md               # Project overview (you are here)
```

---

### 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo and create a feature branch.
2. Write tests for new functionality.
3. Submit a pull request with a clear description.

---

### 📄 License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

### 📅 Citations

<sup>\[1]</sup> Miron, M., Jansen, A., Nagrani, A., et al. (2022). *AVES: Animal Vocalization Encoder based on Self-Supervision*. [arXiv:2210.14493](https://arxiv.org/abs/2210.14493)

<sup>\[2]</sup> Robinson, D., Miron, M., Hagiwara, M., & Pietquin, O. (2025). *NatureLM-audio: an Audio-Language Foundation Model for Bioacoustics*. In *Proceedings of the International Conference on Learning Representations (ICLR)*. [OpenReview](https://openreview.net/forum?id=hJVdwBpWjt)

@inproceedings{robinson2025naturelm,
  title     = {NatureLM-audio: an Audio-Language Foundation Model for Bioacoustics},
  author    = {David Robinson and Marius Miron and Masato Hagiwara and Olivier Pietquin},
  booktitle = {Proceedings of the International Conference on Learning Representations (ICLR)},
  year      = {2025},
  url       = {https://openreview.net/forum?id=hJVdwBpWjt}
}

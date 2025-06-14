# 🧱 Base CSS – blocs.css

**Chemin :** `assets/css/style-base/blocs.css`  
**But :** Fournir une base CSS modulaire et réutilisable pour structurer tout le site **Codex Mental**.

---

## 🧱 Classes de structure

| Classe            | Rôle |
|-------------------|------|
| `.section-2cols`  | Section flexible en 2 colonnes (responsive) |
| `.bloc-half`      | Bloc de largeur 50% (devient 100% sur mobile) |
| `.bloc-full`      | Bloc pleine largeur avec même style visuel |
| `.texte-secondaire` | Paragraphe centré avec style plus doux, utilisé pour réflexions ou précisions personnelles |

---

## 🎨 Cartes & grilles

| Classe         | Rôle |
|----------------|------|
| `.grid-auto`   | Grille responsive avec colonnes auto-fit |
| `.card`        | Bloc visuel type carte (arrondi, ombre, hover) |
| `.card h3`     | Titre stylisé avec Orbitron |

---

## 💡 Tips d’utilisation

- Ces classes sont pensées pour être **réutilisées sur toutes les pages** : profil, projets, blog, etc.
- **Couleurs, ombres et polices** sont pilotées via les variables CSS (`--bloc-bg`, `--text-primary`, etc.).
- Tu peux les mixer librement :

```html
<section class="section-2cols">
  <div class="bloc-half">...</div>
  <div class="bloc-half">...</div>
</section>
```

---

## ✅ Exemple complet

```html
<section class="section-2cols">
  <div class="bloc-half">
    <h2>🧠 Compétences</h2>
    <p><strong>INFORMATIQUE</strong><br>HTML, CSS, JS, IA générative</p>
  </div>
  <div class="bloc-half">
    <h2>🎓 Formation</h2>
    <p><strong>2023</strong> Titre Pro Employé Administratif et Accueil</p>
  </div>
</section>
```

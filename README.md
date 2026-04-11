# Revisio IBO

Application web mobile conçue pour deux utilisatrices qui révisent ensemble chaque jour.

## Ce que l’app propose

- Choix de profil entre deux utilisatrices : `G` et `R`
- Streak commun affiché en grand
- Suivi des tâches journalières : lecture, création de flashcards, test
- Lecture : chronomètre intégré, saisie manuelle et historique de lecture
- Création de flashcards avec question, réponse, tags, explication et message
- Bibliothèque de toutes les cartes avec filtre par tag et tri par date
- Test de flashcards avec répétition espacée inspirée d’Anki
- Quiz IBO avec 100 questions intégrées et import d’annales JSON
- Test mensuel IBO réel, enregistrement du score et jokers automatiques
- Profil comparatif, statistiques, progression par chapitre, points faibles, badges, récapitulatif hebdomadaire
- Fonctionne hors ligne grâce au service worker

## Installation locale

1. Ouvre le dossier dans VS Code.
2. Lance un serveur local depuis le terminal :

   ```powershell
   python -m http.server 8000
   ```

3. Ouvre `http://localhost:8000` dans ton navigateur.

## Utilisation sur téléphone

1. Ouvre l’URL de l’application sur ton téléphone.
2. Installe l’application via le menu du navigateur : "Ajouter à l’écran d’accueil" ou "Installer l’application".
3. L’application fonctionne hors ligne après le premier chargement.

## Déploiement GitHub Pages

1. Initialise Git si ce n’est pas déjà fait :

   ```powershell
   git init
   git add .
   git commit -m "Initial app Revisio IBO"
   ```

2. Crée un dépôt GitHub, puis ajoute le remote :

   ```powershell
   git remote add origin https://github.com/<ton-utilisateur>/<ton-repo>.git
   git branch -M main
   git push -u origin main
   ```

3. Active GitHub Pages dans les paramètres du dépôt :
   - `Settings` > `Pages`
   - Branche `main`, dossier `/`

4. Ouvre l’URL :

   ```text
   https://<ton-utilisateur>.github.io/<ton-repo>/
   ```

## Notes techniques

- Le stockage se fait localement dans `localStorage`.
- Le service worker met en cache les fichiers pour un usage hors ligne.
- Le projet est réalisé en HTML, CSS, JavaScript et ne contient pas de Flutter / Dart.

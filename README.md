# English Teacher - Application d'apprentissage de l'anglais

Une application web moderne conçue pour enseigner l'anglais aux francophones du Congo.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
- **Leçons structurées** pour apprendre l'anglais par étapes
- **Vocabulaire interactif** avec définitions et exemples
- **Quizzes** pour tester vos connaissances
- **Tableau de bord** pour suivre votre progression
- **Interface en français** pour meilleure compréhension

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React moderne
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Supabase** - Backend, authentification, et base de données
- **React i18next** - Internationalisation (i18n)

## 📋 Prérequis

- Node.js 18+ installé
- Compte Supabase gratuit (https://supabase.com)
- Navigateur moderne

## ⚙️ Installation

### 1. Cloner le projet et installer les dépendances

```bash
cd english-teacher-app
npm install
```

### 2. Configurer Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans Settings → API et copiez:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```bash
cp .env.local.example .env.local
```

Remplissez les valeurs:

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

### 4. Configurer la base de données

1. Dans Supabase, allez dans l'éditeur SQL
2. Ouvrez le fichier `docs/DATABASE_SETUP.sql`
3. Copiez le contenu entièrement et exécutez-le dans l'éditeur SQL de Supabase

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera disponible à `http://localhost:3000`

## 📚 Structure du projet

```
src/
├── app/              # Pages Next.js (routing)
│   ├── page.tsx      # Page d'accueil
│   ├── login/        # Page de connexion
│   ├── signup/       # Page d'inscription
│   ├── dashboard/    # Tableau de bord
│   ├── lessons/      # Leçons
│   └── vocabulary/   # Vocabulaire
├── components/       # Composants React réutilisables
├── contexts/         # Context API (authentification)
├── lib/             # Utilitaires et configurations
│   ├── supabase.ts  # Client Supabase
│   ├── i18n.ts      # Configuration i18n
│   └── locales/     # Fichiers de traduction
└── styles/          # Fichiers CSS

```

## 🔐 Authentification

L'application utilise Supabase Auth pour gérer:
- Inscription avec email
- Connexion
- Vérification d'email
- Gestion des sessions

## 📊 Base de données

Tables principales:
- **users** - Profils utilisateurs
- **lessons** - Leçons d'anglais
- **vocabulary** - Mots de vocabulaire
- **quiz_questions** - Questions de quiz
- **user_progress** - Progression des utilisateurs
- **quiz_attempts** - Réponses aux quizzes
- **learned_vocabulary** - Mots appris par l'utilisateur

## 🚀 Déploiement

### Déployer sur Vercel (recommandé)

1. Poussez le code sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Connectez votre repository
4. Ajoutez les variables d'environnement Supabase
5. Déployez!

```bash
npm run build
npm start
```

## 📝 Prochaines étapes

- [ ] Ajouter des leçons initiales (15-20 leçons)
- [ ] Créer les pages de détail des leçons
- [ ] Implémenter la page des quizzes
- [ ] Ajouter la lecture audio (text-to-speech)
- [ ] Optimiser pour mobile et faible bande passante
- [ ] Ajouter des animations et transitions
- [ ] Implémenter la fonctionnalité offline
- [ ] Tester avec des utilisateurs réels au Congo

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à:
1. Forker le projet
2. Créer une branche pour votre feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📧 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

---

**Fait avec ❤️ pour les apprenants du Congo**

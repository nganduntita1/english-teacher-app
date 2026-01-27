# 🔧 Commandes essentielles - English Teacher App

## 📂 Naviguer vers le projet

```bash
cd /Users/mac/Documents/english-teacher-app
```

---

## 🚀 Développement local

### Démarrer le serveur de développement
```bash
npm run dev
```
Puis ouvrez: **http://localhost:3000**

Arrêter: **Ctrl+C**

### Lancer en mode production local
```bash
npm run build
npm start
```

---

## 📦 Gestion des dépendances

### Installer tous les packages
```bash
npm install
```

### Ajouter un nouveau package
```bash
npm install nom-du-package
```

### Mettre à jour les packages
```bash
npm update
```

### Vérifier les dépendances obsolètes
```bash
npm outdated
```

---

## 🧹 Nettoyage & Maintenance

### Supprimer les fichiers de cache
```bash
rm -rf .next
npm cache clean --force
```

### Réinstaller complètement
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vérifier et corriger les problèmes
```bash
npm audit
npm audit fix
```

---

## 🔍 Vérification du code

### Linter (vérifier la syntaxe)
```bash
npm run lint
```

### Vérifier les types TypeScript
```bash
npx tsc --noEmit
```

---

## 🗄️ Supabase

### Exécuter le script de base de données

1. **Via terminal** (créer un fichier):
```bash
cat > setup.sql << 'EOF'
-- Copiez le contenu de docs/DATABASE_SETUP.sql ici
EOF
```

2. **Via Supabase Console**:
- Ouvrez https://supabase.com
- Allez dans votre projet
- Cliquez sur "SQL Editor"
- Nouvelle requête
- Copiez le contenu de `docs/DATABASE_SETUP.sql`
- Cliquez "Run"

### Ajouter des données d'exemple
1. Ouvrez `docs/SAMPLE_DATA.sql`
2. Copiez le contenu
3. Exécutez dans Supabase SQL Editor
4. Cliquez "Run"

---

## 📝 Fichiers de configuration importants

### Variables d'environnement
```bash
# Voir le contenu
cat .env.local

# Créer depuis le template
cp .env.local.example .env.local

# Éditer
nano .env.local  # ou vim, ou votre éditeur préféré
```

### Configuration Next.js
```bash
# next.config.js
cat next.config.js

# tailwind.config.js
cat tailwind.config.js

# tsconfig.json
cat tsconfig.json
```

---

## 📚 Voir les fichiers importants

```bash
# Vue d'ensemble
cat README.md

# Guide rapide
cat QUICKSTART.md

# Résumé du projet
cat PROJECT_SUMMARY.md

# Ce qu'on a fait
cat COMPLETION_SUMMARY.md

# Setup de la base de données
cat docs/DATABASE_SETUP.sql

# Données d'exemple
cat docs/SAMPLE_DATA.sql
```

---

## 🚢 Déploiement

### Sur Vercel (recommandé)
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Ajouter les env vars dans le dashboard Vercel
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Préview de la build de production
```bash
npm run build
npm start
```
Ouvrez: http://localhost:3000

---

## 🐛 Dépannage

### Erreur: "node_modules not found"
```bash
npm install
```

### Erreur de port déjà utilisé (3000)
```bash
# Tuer le processus
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
npm run dev -- -p 3001
```

### Erreur de build
```bash
# Nettoyer et réinstaller
rm -rf .next node_modules
npm install
npm run build
```

### Variables d'environnement non détectées
```bash
# Vérifier le fichier
cat .env.local

# Relancer le serveur après modification
# (Ctrl+C puis npm run dev)
```

---

## 📊 Surveiller la performance

### Vérifier la taille des bundles
```bash
npm run build  # Check les logs à la fin

# Voir le détail dans .next/analyze
```

### Auditer les dépendances
```bash
npm audit
```

### Vérifier les types
```bash
npx tsc --noEmit
```

---

## 💾 Sauvegarde et récupération

### Créer une sauvegarde du projet
```bash
cd /Users/mac/Documents
tar -czf english-teacher-app-backup.tar.gz english-teacher-app

# Restaurer depuis une sauvegarde
tar -xzf english-teacher-app-backup.tar.gz
```

### Git (si vous utilisez GitHub)
```bash
# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Initial commit: English Teacher App"

# Pousser vers GitHub
git remote add origin https://github.com/votre-username/english-teacher-app
git push -u origin main
```

---

## 🔐 Secrets et sécurité

### Ne JAMAIS commiter
```bash
# Ces fichiers sont ignorés (.gitignore)
.env.local
.env.*.local
node_modules/
.next/
```

### Changer les clés Supabase compromises
```
1. Allez dans Supabase Dashboard
2. Settings → API → Regenerate keys
3. Mettez à jour .env.local
4. Redéployez
```

---

## 📈 Mettre à jour les dépendances

### Vérifier les mises à jour disponibles
```bash
npm outdated
```

### Mettre à jour tout
```bash
npm update
```

### Mettre à jour un package spécifique
```bash
npm install package-name@latest
```

### Vérifier la compatibilité après update
```bash
npm run build
npm audit
```

---

## 🎯 Commandes rapides (aliases utiles)

Vous pouvez ajouter ces raccourcis:

```bash
# Ajouter à votre .zshrc ou .bashrc
alias ct='cd /Users/mac/Documents/english-teacher-app'
alias dev='npm run dev'
alias build='npm run build'
alias start='npm start'
alias lint='npm run lint'
```

Puis utiliser:
```bash
ct          # Aller au projet
dev         # Démarrer le serveur
build       # Compiler
start       # Production
lint        # Vérifier le code
```

---

## 📞 Besoin d'aide?

Commandes utiles:
```bash
# Voir l'aide npm
npm help

# Voir la version
npm -v
node -v

# Voir les scripts disponibles
cat package.json | grep -A 5 '"scripts"'

# Documentation Next.js
open https://nextjs.org/docs

# Documentation Supabase
open https://supabase.com/docs
```

---

## 🎊 Résumé des commandes fréquentes

```bash
# 1. Démarrage (la commande la plus fréquente!)
npm run dev

# 2. Vérifier que tout va bien
npm run build

# 3. Installer une nouvelle dépendance
npm install nom-du-package

# 4. Lancer les tests/vérification
npm run lint

# 5. Nettoyer si problème
rm -rf .next node_modules && npm install

# 6. Déployer vers Vercel
vercel
```

---

**N'oubliez pas**: 
- Les changements au `.env.local` nécessitent un redémarrage du serveur dev (Ctrl+C puis `npm run dev`)
- Toujours faire `npm run build` avant de déployer
- Garder `.env.local` secret et ne pas le pousser sur GitHub

Bonne chance! 🚀

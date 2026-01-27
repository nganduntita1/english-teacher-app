# 🚀 Guide de démarrage rapide - English Teacher

## Étape 1: Créer un compte Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte gratuit
2. Créez un nouveau projet (choisissez n'importe quelle région)
3. Attendez que le projet soit créé (quelques minutes)

## Étape 2: Récupérer les clés Supabase

1. Dans votre projet Supabase, cliquez sur **Settings** (⚙️) en bas à gauche
2. Cliquez sur **API** dans le menu
3. Vous verrez deux clés à copier:
   - **Project URL** - Copiez cette URL
   - **anon public key** - Copiez cette clé

## Étape 3: Configurer les variables d'environnement

1. Ouvrez le terminal à la racine du projet `/Users/mac/Documents/english-teacher-app`
2. Modifiez le fichier `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
```

## Étape 4: Configurer la base de données

1. Retournez dans Supabase → votre projet
2. Cliquez sur **SQL Editor** (icône de console)
3. Créez une nouvelle requête
4. Copiez le contenu du fichier `docs/DATABASE_SETUP.sql`
5. Collez tout dans l'éditeur SQL
6. Cliquez sur **Run** (flèche verte)

Attendez que tout s'exécute sans erreur ✓

## Étape 5: Lancer l'application

```bash
cd /Users/mac/Documents/english-teacher-app
npm run dev
```

L'application sera disponible à: **http://localhost:3000**

## Tester l'authentification

1. Allez sur http://localhost:3000
2. Cliquez sur **S'inscrire**
3. Remplissez le formulaire avec:
   - Nom: (n'importe quel nom)
   - Email: (un email valide ou test@example.com)
   - Mot de passe: (au moins 6 caractères)
4. Cliquez sur **S'inscrire**

Si vous voyez un message de succès, c'est qu'il fonctionne! ✓

## Prochaines étapes

### Ajouter des leçons initiales

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête avec:

```sql
INSERT INTO lessons (title, description, content, level, order_index) VALUES
('Salutations de base', 'Apprenez à saluer en anglais', 'Hello, Hi, Good morning, Good afternoon, Good evening, Goodbye', 'beginner', 1),
('Nombres 1-10', 'Apprenez à compter de 1 à 10', 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten', 'beginner', 2),
('Jours de la semaine', 'Les jours en anglais', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday', 'beginner', 3);
```

3. Cliquez sur **Run**

### Ajouter du vocabulaire

```sql
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE title = 'Salutations de base'), 'Hello', 'Bonjour', 'Hello, how are you?', 'Bonjour, comment allez-vous?'),
((SELECT id FROM lessons WHERE title = 'Salutations de base'), 'Goodbye', 'Au revoir', 'Goodbye, see you later!', 'Au revoir, à bientôt!');
```

## 🐛 Dépannage

### Erreur: "Missing NEXT_PUBLIC_SUPABASE_URL"
→ Vérifiez que votre `.env.local` contient les clés correctes

### La base de données ne se configure pas
→ Copiez/collez tout le contenu de `DATABASE_SETUP.sql` (pas juste une partie)

### Impossible de s'inscrire
→ Vérifiez que les clés Supabase sont correctes dans `.env.local`

### Le site ne se charge pas après modification
→ Appuyez sur **Ctrl+C** dans le terminal et relancez avec `npm run dev`

## 📞 Besoin d'aide?

Consultez la [documentation Supabase](https://supabase.com/docs) ou le [README.md](README.md) du projet.

---

**Bravo! Vous avez une application d'apprentissage de l'anglais fonctionnelle!** 🎉

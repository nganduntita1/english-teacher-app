-- Sample Data for English Teacher App
-- Execute this in Supabase SQL Editor to populate initial content

-- Insert sample lessons
INSERT INTO lessons (title, description, content, level, order_index) VALUES
('Salutations de base', 'Apprenez à saluer et à vous présenter en anglais', 'Hello = Bonjour, Hi = Salut, Good morning = Bon matin, Good afternoon = Bon après-midi, Good evening = Bon soir, Goodbye = Au revoir, See you later = À bientôt', 'beginner', 1),
('Chiffres 1-20', 'Apprenez à compter de 1 à 20 en anglais', 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Eleven, Twelve, Thirteen, Fourteen, Fifteen, Sixteen, Seventeen, Eighteen, Nineteen, Twenty', 'beginner', 2),
('Jours de la semaine', 'Mémorisez les jours de la semaine', 'Monday (Lundi), Tuesday (Mardi), Wednesday (Mercredi), Thursday (Jeudi), Friday (Vendredi), Saturday (Samedi), Sunday (Dimanche)', 'beginner', 3),
('Mois de l''année', 'Apprenez les 12 mois de l''année', 'January, February, March, April, May, June, July, August, September, October, November, December', 'beginner', 4),
('Couleurs essentielles', 'Les couleurs les plus communes en anglais', 'Red (Rouge), Blue (Bleu), Green (Vert), Yellow (Jaune), Black (Noir), White (Blanc), Pink (Rose), Orange (Orange), Purple (Violet), Brown (Marron)', 'beginner', 5),
('Métiers courants', 'Les métiers et professions en anglais', 'Doctor (Médecin), Teacher (Enseignant), Engineer (Ingénieur), Nurse (Infirmière), Lawyer (Avocat), Chef (Cuisinier), Police Officer (Agent de police), Farmer (Fermier)', 'beginner', 6),
('Aliments communs', 'Vocabulaire des aliments et boissons', 'Apple (Pomme), Bread (Pain), Chicken (Poulet), Rice (Riz), Water (Eau), Coffee (Café), Milk (Lait), Egg (Œuf), Fish (Poisson), Cheese (Fromage)', 'beginner', 7),
('Parties du corps', 'Apprenez les parties du corps humain', 'Head (Tête), Eye (Œil), Nose (Nez), Mouth (Bouche), Ear (Oreille), Arm (Bras), Hand (Main), Leg (Jambe), Foot (Pied), Heart (Cœur)', 'beginner', 8),
('Animaux domestiques', 'Découvrez les noms des animaux familiers en anglais', 'Dog (Chien), Cat (Chat), Bird (Oiseau), Fish (Poisson), Rabbit (Lapin), Hamster (Hamster), Parrot (Perroquet), Turtle (Tortue), Mouse (Souris), Horse (Cheval)', 'beginner', 9);

-- Insert vocabulary for Lesson 1: Salutations
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE order_index = 1), 'Hello', 'Bonjour', 'Hello, how are you?', 'Bonjour, comment allez-vous?'),
((SELECT id FROM lessons WHERE order_index = 1), 'Hi', 'Salut', 'Hi there, my friend!', 'Salut mon ami!'),
((SELECT id FROM lessons WHERE order_index = 1), 'Good morning', 'Bon matin', 'Good morning, have a nice day!', 'Bon matin, bonne journée!'),
((SELECT id FROM lessons WHERE order_index = 1), 'Goodbye', 'Au revoir', 'Goodbye, see you soon!', 'Au revoir, à bientôt!'),
((SELECT id FROM lessons WHERE order_index = 1), 'Nice to meet you', 'Enchanté de vous rencontrer', 'Nice to meet you too!', 'Enchanté aussi!');

-- Insert vocabulary for Lesson 2: Numbers
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE order_index = 2), 'One', 'Un', 'I have one apple', 'J''ai une pomme'),
((SELECT id FROM lessons WHERE order_index = 2), 'Two', 'Deux', 'I have two cats', 'J''ai deux chats'),
((SELECT id FROM lessons WHERE order_index = 2), 'Three', 'Trois', 'There are three books', 'Il y a trois livres'),
((SELECT id FROM lessons WHERE order_index = 2), 'Five', 'Cinq', 'I have five fingers', 'J''ai cinq doigts'),
((SELECT id FROM lessons WHERE order_index = 2), 'Ten', 'Dix', 'Ten is a round number', 'Dix est un chiffre rond');

-- Insert vocabulary for Lesson 3: Days
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE order_index = 3), 'Monday', 'Lundi', 'Monday is the start of the week', 'Lundi est le début de la semaine'),
((SELECT id FROM lessons WHERE order_index = 3), 'Wednesday', 'Mercredi', 'Wednesday is in the middle of the week', 'Mercredi est au milieu de la semaine'),
((SELECT id FROM lessons WHERE order_index = 3), 'Friday', 'Vendredi', 'Friday is my favorite day', 'Vendredi est mon jour préféré'),
((SELECT id FROM lessons WHERE order_index = 3), 'Saturday', 'Samedi', 'Saturday is a day to rest', 'Samedi est un jour pour se reposer'),
((SELECT id FROM lessons WHERE order_index = 3), 'Sunday', 'Dimanche', 'Sunday is the last day of the week', 'Dimanche est le dernier jour de la semaine');

-- Insert vocabulary for Lesson 5: Colors
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE order_index = 5), 'Red', 'Rouge', 'The car is red', 'La voiture est rouge'),
((SELECT id FROM lessons WHERE order_index = 5), 'Blue', 'Bleu', 'The sky is blue', 'Le ciel est bleu'),
((SELECT id FROM lessons WHERE order_index = 5), 'Green', 'Vert', 'The tree is green', 'L''arbre est vert'),
((SELECT id FROM lessons WHERE order_index = 5), 'Yellow', 'Jaune', 'The sun is yellow', 'Le soleil est jaune'),
((SELECT id FROM lessons WHERE order_index = 5), 'Black', 'Noir', 'The night is black', 'La nuit est noire');

-- Insert vocabulary for Lesson 9: Pets
INSERT INTO vocabulary (lesson_id, word, french_meaning, example_en, example_fr) VALUES
((SELECT id FROM lessons WHERE order_index = 9), 'Dog', 'Chien', 'I have a dog', 'J''ai un chien'),
((SELECT id FROM lessons WHERE order_index = 9), 'Cat', 'Chat', 'The cat is sleeping', 'Le chat dort'),
((SELECT id FROM lessons WHERE order_index = 9), 'Bird', 'Oiseau', 'The bird is singing', 'L''oiseau chante'),
((SELECT id FROM lessons WHERE order_index = 9), 'Fish', 'Poisson', 'I have three fish', 'J''ai trois poissons'),
((SELECT id FROM lessons WHERE order_index = 9), 'Rabbit', 'Lapin', 'The rabbit is cute', 'Le lapin est mignon');

-- Insert sample quiz questions for Lesson 1
INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, explanation) VALUES
((SELECT id FROM lessons WHERE order_index = 1), 
'Que dites-vous pour saluer quelqu''un le matin?', 
'["Good morning", "Good night", "Goodbye", "See you later"]', 
'Good morning', 
'Good morning est utilisé pour saluer quelqu''un le matin. Bonne réponse!'),
((SELECT id FROM lessons WHERE order_index = 1), 
'Quel mot veut dire "Au revoir" en anglais?', 
'["Hello", "Goodbye", "Hi", "Good day"]', 
'Goodbye', 
'Goodbye signifie "Au revoir". Vous avez raison!'),
((SELECT id FROM lessons WHERE order_index = 1), 
'Comment dit-on "Bonjour" en anglais?', 
'["Hi", "Bye", "Hello", "Good night"]', 
'Hello', 
'Hello est le mot pour "Bonjour". Excellent!');

-- Insert sample quiz questions for Lesson 2
INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, explanation) VALUES
((SELECT id FROM lessons WHERE order_index = 2), 
'Quel chiffre vient après "One"?', 
'["Two", "Three", "Zero", "Four"]', 
'Two', 
'Two (2) vient après One (1). Correct!'),
((SELECT id FROM lessons WHERE order_index = 2), 
'Comment dit-on "5" en anglais?', 
'["Four", "Five", "Six", "Seven"]', 
'Five', 
'Five est le mot pour le chiffre 5. Bravo!'),
((SELECT id FROM lessons WHERE order_index = 2), 
'Quel est le mot pour "10"?', 
'["Eight", "Nine", "Ten", "Eleven"]', 
'Ten', 
'Ten est le mot pour 10. Bonne réponse!');

-- Insert sample quiz questions for Lesson 9: Pets
INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, explanation) VALUES
((SELECT id FROM lessons WHERE order_index = 9), 
'Comment dit-on "chien" en anglais?', 
'["Cat", "Dog", "Bird", "Fish"]', 
'Dog', 
'Dog signifie "chien". Correct!'),
((SELECT id FROM lessons WHERE order_index = 9), 
'Quel animal dit "meow" en anglais?', 
'["Dog", "Bird", "Cat", "Rabbit"]', 
'Cat', 
'Cat = Chat. Le chat dit "meow". Bravo!'),
((SELECT id FROM lessons WHERE order_index = 9), 
'Quel est le mot anglais pour "oiseau"?', 
'["Fish", "Bird", "Dog", "Hamster"]', 
'Bird', 
'Bird est le mot pour "oiseau". Excellent!');

-- Note: To view the data you added, go to Supabase and check:
-- 1. lessons table (should have 9 lessons now)
-- 2. vocabulary table (should have many words)
-- 3. quiz_questions table (should have quiz entries)

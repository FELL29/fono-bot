-- Inserir tracks de exemplo para cada perfil e faixa etária
INSERT INTO public.tracks (id, name, profile, age_range) VALUES
  (gen_random_uuid(), 'Desenvolvimento Típico 1-3 anos', 'Típico_1-3', '1-3'),
  (gen_random_uuid(), 'Desenvolvimento Típico 4-6 anos', 'Típico_4-6', '4-6'),
  (gen_random_uuid(), 'Desenvolvimento Típico 7-10 anos', 'Típico_7-10', '7-10'),
  (gen_random_uuid(), 'Desenvolvimento Típico 11-14 anos', 'Típico_11-14', '11-14'),
  (gen_random_uuid(), 'TEA 1-3 anos', 'TEA_1-3', '1-3'),
  (gen_random_uuid(), 'TEA 4-6 anos', 'TEA_4-6', '4-6'),
  (gen_random_uuid(), 'TEA 7-10 anos', 'TEA_7-10', '7-10'),
  (gen_random_uuid(), 'TEA 11-14 anos', 'TEA_11-14', '11-14'),
  (gen_random_uuid(), 'Síndrome de Down 1-3 anos', 'Down_1-3', '1-3'),
  (gen_random_uuid(), 'Síndrome de Down 4-6 anos', 'Down_4-6', '4-6'),
  (gen_random_uuid(), 'Síndrome de Down 7-10 anos', 'Down_7-10', '7-10'),
  (gen_random_uuid(), 'Síndrome de Down 11-14 anos', 'Down_11-14', '11-14'),
  (gen_random_uuid(), 'Atraso de Desenvolvimento 1-3 anos', 'Atraso_1-3', '1-3'),
  (gen_random_uuid(), 'Atraso de Desenvolvimento 4-6 anos', 'Atraso_4-6', '4-6'),
  (gen_random_uuid(), 'Atraso de Desenvolvimento 7-10 anos', 'Atraso_7-10', '7-10'),
  (gen_random_uuid(), 'Atraso de Desenvolvimento 11-14 anos', 'Atraso_11-14', '11-14');

-- Inserir atividades de exemplo para alguns tracks
WITH track_data AS (
  SELECT id, profile FROM public.tracks WHERE profile IN ('Típico_1-3', 'TEA_1-3', 'Atraso_1-3')
)
INSERT INTO public.activities (track_id, day_index, title, instructions) 
SELECT 
  t.id,
  day_num,
  activity_title,
  activity_instructions
FROM track_data t
CROSS JOIN (
  VALUES 
    (1, 'Sons de Animais', 'Mostre figuras de animais para {{child_name}} e faça os sons correspondentes. Peça para {{child_name}} imitar os sons. Pratique "muu" da vaca, "au au" do cachorro, "miau" do gato por 10 minutos.'),
    (2, 'Brincadeira com Bolhas', 'Faça bolhas de sabão e peça para {{child_name}} estourar dizendo "POP!". Incentive a fala "mais bolhas" quando acabarem. Duration: 15 minutos.'),
    (3, 'Nomeação de Objetos', 'Pegue 5 objetos familiares (bola, boneca, carro, copo, livro). Mostre cada um e diga o nome claramente. Peça para {{child_name}} repetir. Pratique por 10 minutos.'),
    (4, 'Música e Movimento', 'Cante músicas simples como "Se Você Está Contente" fazendo os gestos. Encoraje {{child_name}} a participar com movimentos e sons. Duration: 15 minutos.'),
    (5, 'Comandos Simples', 'Pratique comandos de uma palavra: "vem", "senta", "para", "vai". Use gestos para ajudar {{child_name}} a entender. Elogie cada tentativa de resposta.'),
    (6, 'Brincadeira de Imitação', 'Faça sons e gestos simples (bater palmas, mandar beijinho, acenar). Peça para {{child_name}} imitar. Torne divertido e celebre cada imitação.'),
    (7, 'História com Figuras', 'Conte uma história simples usando um livro com figuras grandes. Aponte e nomeie os objetos/personagens. Faça perguntas simples: "Onde está o gato?"')
) AS activities(day_num, activity_title, activity_instructions);

-- Adicionar mais atividades para TEA especificamente
WITH tea_track AS (
  SELECT id FROM public.tracks WHERE profile = 'TEA_1-3' LIMIT 1
)
INSERT INTO public.activities (track_id, day_index, title, instructions)
SELECT 
  t.id,
  day_num,
  activity_title,
  activity_instructions
FROM tea_track t
CROSS JOIN (
  VALUES 
    (8, 'Rotina Visual', 'Use figuras para mostrar a rotina do dia para {{child_name}}. Aponte cada atividade antes de fazê-la. Ajuda na compreensão e reduz ansiedade.'),
    (9, 'Comunicação por Gestos', 'Ensine gestos simples: "mais", "acabou", "ajuda". Use sempre com a palavra falada. Pratique durante as refeições e brincadeiras.'),
    (10, 'Atenção Compartilhada', 'Aponte para objetos interessantes e diga "olha!". Espere {{child_name}} olhar também. Compartilhe a observação por alguns segundos antes de continuar.')
) AS activities(day_num, activity_title, activity_instructions);

-- Adicionar atividades para Atraso de Desenvolvimento
WITH atraso_track AS (
  SELECT id FROM public.tracks WHERE profile = 'Atraso_1-3' LIMIT 1
)
INSERT INTO public.activities (track_id, day_index, title, instructions)
SELECT 
  t.id,
  day_num,
  activity_title,
  activity_instructions  
FROM atraso_track t
CROSS JOIN (
  VALUES 
    (8, 'Estimulação Sensorial', 'Use diferentes texturas (macio, áspero, liso) para {{child_name}} explorar. Nomeie cada textura e permita exploração livre. Estimula desenvolvimento sensorial.'),
    (9, 'Causa e Efeito', 'Brinquedos que fazem barulho quando apertados. Mostre a {{child_name}} como apertar para fazer som. Incentive tentativas independentes.'),
    (10, 'Comunicação Básica', 'Ensine sinais básicos: balançar a cabeça para "não", acenar para "tchau". Use consistentemente para {{child_name}} aprender e imitar.')
) AS activities(day_num, activity_title, activity_instructions);
-- Corrigir o track_id inválido
UPDATE children 
SET track_id = 'fd1b5eae-f5c7-4d45-b931-6decccc9ab49'::uuid  -- TEA 4-6 anos
WHERE track_id = 'bd0cec54-0bb3-4f24-9c6f-8cbb2b5a5c8f'::uuid;

-- Adicionar mais atividades para cada dia (2 atividades adicionais por dia para cada track)
-- Vamos criar atividades adicionais para o track DOWN_1_3 como exemplo

-- Dia 1 - Atividades adicionais
INSERT INTO activities (track_id, title, instructions, day_index, media_url) VALUES
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Exercício de Lábios', 'Faça beijos no ar e movimentos com os lábios para fortalecer a musculatura orofacial.', 1, 'down_1_3_d1_2.mp4'),
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Sons de Animais', 'Imite sons de animais diferentes: miau, au-au, mu, cocorico.', 1, 'down_1_3_d1_3.mp4');

-- Dia 2 - Atividades adicionais  
INSERT INTO activities (track_id, title, instructions, day_index, media_url) VALUES
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Soprar Penas', 'Use penas leves e sopre para movê-las pela mesa ou pelo ar.', 2, 'down_1_3_d2_2.mp4'),
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Vocalização ba-ba', 'Repita sons simples como "ba-ba", "ma-ma", "pa-pa" de forma ritmada.', 2, 'down_1_3_d2_3.mp4');

-- Dia 3 - Atividades adicionais
INSERT INTO activities (track_id, title, instructions, day_index, media_url) VALUES
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Brincar com a Boca', 'Faça caretas engraçadas no espelho, mostrando a língua e movimentando os lábios.', 3, 'down_1_3_d3_2.mp4'),
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Imitar Gestos', 'Imite gestos simples como tchau, oi, bater palmas junto com sons.', 3, 'down_1_3_d3_3.mp4');

-- Dia 4 - Atividades adicionais
INSERT INTO activities (track_id, title, instructions, day_index, media_url) VALUES
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Exercício da Língua', 'Movimente a língua para cima, baixo, esquerda e direita de forma lúdica.', 4, 'down_1_3_d4_2.mp4'),
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Cantar Música Simples', 'Cante músicas simples como "parabéns" ou "atirei o pau no gato" com gestos.', 4, 'down_1_3_d4_3.mp4');

-- Dia 5 - Atividades adicionais
INSERT INTO activities (track_id, title, instructions, day_index, media_url) VALUES
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Brincar de Telefone', 'Use objetos como telefone e estimule a vocalização e turnos de conversação.', 5, 'down_1_3_d5_2.mp4'),
('50089f2a-e602-43be-ba4d-77a079a7c209', 'Massagem com Sons', 'Faça massagem suave no rosto da criança while emitindo sons suaves como "mmm".', 5, 'down_1_3_d5_3.mp4');
SET NAMES utf8mb4;
USE soundnest_db;

INSERT INTO users (name, email, password, role, status) VALUES
('Administrador SoundNest', 'admin@soundnest.com', 'Admin12345', 'admin', 'active'),
('Juan Tibamoso', 'juan@soundnest.com', 'Juan12345', 'user', 'active'),
('Laura Gómez', 'laura@soundnest.com', 'Laura12345', 'user', 'active'),
('Carlos Ruiz', 'carlos@soundnest.com', 'Carlos12345', 'user', 'suspended');

INSERT INTO genres (name) VALUES
('Reggaetón'), ('Pop'), ('R&B'), ('Rock'), ('Electrónica'), ('Hip Hop');

INSERT INTO artists (name, bio, status) VALUES
('Bad Bunny', 'Cantante y compositor puertorriqueño de música urbana.', 'active'),
('The Weeknd', 'Cantante canadiense de R&B y pop.', 'active'),
('Karol G', 'Cantante colombiana de música urbana.', 'active'),
('Arctic Monkeys', 'Banda británica de rock.', 'active'),
('Dua Lipa', 'Cantante británica de pop.', 'active');

INSERT INTO albums (artist_id, title, release_date) VALUES
(1, 'Un Verano Sin Ti', '2022-05-06'),
(2, 'Starboy', '2016-11-25'),
(2, 'After Hours', '2020-03-20'),
(3, 'Mañana Será Bonito', '2023-02-24'),
(4, 'AM', '2013-09-09'),
(5, 'Future Nostalgia', '2020-03-27');

INSERT INTO songs (album_id, genre_id, title, duration_seconds, track_number, status) VALUES
(1, 1, 'Moscow Mule', 245, 1, 'active'),
(1, 1, 'Después de la Playa', 230, 2, 'active'),
(1, 1, 'Me Porto Bonito', 178, 3, 'active'),
(1, 1, 'Tití Me Preguntó', 243, 4, 'active'),
(2, 3, 'Starboy', 230, 1, 'active'),
(2, 3, 'Party Monster', 249, 2, 'active'),
(3, 2, 'Blinding Lights', 200, 9, 'active'),
(3, 2, 'In Your Eyes', 237, 10, 'active'),
(3, 2, 'Save Your Tears', 215, 11, 'active'),
(4, 1, 'Mientras Me Curo del Cora', 196, 1, 'active'),
(4, 1, 'Provenza', 210, 2, 'inactive'),
(5, 4, 'Do I Wanna Know?', 272, 1, 'active'),
(5, 4, 'R U Mine?', 201, 2, 'active'),
(6, 2, 'Don''t Start Now', 183, 2, 'active'),
(6, 2, 'Levitating', 203, 5, 'active');

INSERT INTO playlists (user_id, name, is_public) VALUES
(2, 'Chill vibes', FALSE),
(2, 'Para estudiar', TRUE),
(3, 'Fiesta', TRUE);

INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES
(1, 7, 1), (1, 9, 2), (1, 12, 3),
(2, 5, 1), (2, 13, 2),
(3, 3, 1), (3, 4, 2), (3, 15, 3);

INSERT INTO tags (name) VALUES ('bailable'), ('nostalgia'), ('clásico');

INSERT INTO reviews (user_id, song_id, rating, comment, listen_count, status) VALUES
(2, 7, 5, 'De mis canciones favoritas para manejar de noche.', 40, 'visible'),
(3, 3, 4, NULL, NULL, 'visible'),
(2, 12, 5, 'Un clásico del rock británico.', NULL, 'visible'),
(3, 7, 1, 'Contenido inapropiado de prueba para moderación.', NULL, 'hidden');

INSERT INTO review_tags (review_id, tag_id) VALUES (1, 2), (2, 1), (3, 3);

INSERT INTO play_events (user_id, song_id, played_at, listened_seconds) VALUES
(2, 7, '2026-10-10 08:15:00', 200),
(2, 9, '2026-10-10 08:19:00', 215),
(2, 12, '2026-10-11 21:40:00', 150),
(2, 7, '2026-10-12 07:55:00', 200),
(3, 3, '2026-10-12 23:10:00', 178),
(3, 15, '2026-10-13 00:05:00', 203);

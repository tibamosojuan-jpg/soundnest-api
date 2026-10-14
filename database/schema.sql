DROP DATABASE IF EXISTS soundnest_db;
CREATE DATABASE soundnest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soundnest_db;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    bio TEXT NULL,
    image_url VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genres (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE albums (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    artist_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    release_date DATE NULL,
    cover_url VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_albums_artist FOREIGN KEY (artist_id)
        REFERENCES artists (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE songs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    album_id INT UNSIGNED NOT NULL,
    genre_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    duration_seconds INT UNSIGNED NOT NULL,
    track_number SMALLINT UNSIGNED NOT NULL,
    audio_url VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_songs_album_track UNIQUE (album_id, track_number),
    CONSTRAINT chk_songs_duration CHECK (duration_seconds > 0),
    CONSTRAINT fk_songs_album FOREIGN KEY (album_id)
        REFERENCES albums (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_songs_genre FOREIGN KEY (genre_id)
        REFERENCES genres (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE playlists (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    cover_url VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_playlists_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE playlist_songs (
    playlist_id INT UNSIGNED NOT NULL,
    song_id INT UNSIGNED NOT NULL,
    position SMALLINT UNSIGNED NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, song_id),
    CONSTRAINT fk_playlist_songs_playlist FOREIGN KEY (playlist_id)
        REFERENCES playlists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_playlist_songs_song FOREIGN KEY (song_id)
        REFERENCES songs (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    song_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NULL,
    listen_count INT UNSIGNED NULL,
    status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reviews_user_song UNIQUE (user_id, song_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_song FOREIGN KEY (song_id)
        REFERENCES songs (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE review_tags (
    review_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (review_id, tag_id),
    CONSTRAINT fk_review_tags_review FOREIGN KEY (review_id)
        REFERENCES reviews (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_tags_tag FOREIGN KEY (tag_id)
        REFERENCES tags (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE play_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    song_id INT UNSIGNED NOT NULL,
    played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    listened_seconds INT UNSIGNED NOT NULL,
    INDEX idx_play_events_user_date (user_id, played_at),
    CONSTRAINT fk_play_events_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_play_events_song FOREIGN KEY (song_id)
        REFERENCES songs (id) ON DELETE CASCADE ON UPDATE CASCADE
);

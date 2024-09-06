CREATE DATABASE noteworthy_db;
USE noteworthy_db;

CREATE TABLE users (
user_id varchar(255) NOT NULL,
email varchar(255) NOT NULL,
password_hash varchar(255) DEFAULT NULL,
PRIMARY KEY (user_id)
);

CREATE TABLE notes (
note_id int NOT NULL AUTO_INCREMENT,
user_id varchar(255) NOT NULL,
title text NOT NULL,
content mediumtext NOT NULL,
created_epoch_timestamp mediumtext NOT NULL,
PRIMARY KEY (note_id),
KEY fk_user_id (user_id),
CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);
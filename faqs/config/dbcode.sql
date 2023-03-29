DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories
(
    ID SERIAL PRIMARY KEY,
	icon character varying(100) NOT NULL,
	title character varying(200) NOT NULL
);

CREATE TABLE faqs
(
    ID SERIAL PRIMARY KEY,
    question character varying(250) NOT NULL,
	answer TEXT NOT NULL,
	categoryID INTEGER REFERENCES categories(ID) ON DELETE CASCADE NOT NULL
);

CREATE TABLE users
(
    ID SERIAL PRIMARY KEY,
	username VARCHAR(256) UNIQUE NOT NULL,
	password VARCHAR(200) NOT NULL
);


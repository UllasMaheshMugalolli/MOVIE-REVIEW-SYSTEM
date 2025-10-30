CREATE DATABASE MovieDB;
USE MovieDB;

CREATE TABLE Person (
    person_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender CHAR(1) CHECK (gender IN ('M','F','O'))
);

CREATE TABLE Actor (
    actor_id INT PRIMARY KEY,
    FOREIGN KEY (actor_id) REFERENCES Person(person_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Director (
    director_id INT PRIMARY KEY,
    FOREIGN KEY (director_id) REFERENCES Person(person_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Producer (
    producer_id INT PRIMARY KEY,
    FOREIGN KEY (producer_id) REFERENCES Person(person_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Movie (
    movie_id INT PRIMARY KEY,
    title VARCHAR(200) NOT NULL UNIQUE,
    release_date DATE NOT NULL,
    avg_rating DECIMAL(3,1) DEFAULT 0.0
);

CREATE TABLE Genre (
    genre_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Movie_Genre (
    movie_id INT,
    genre_id INT,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genre(genre_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE UserTable (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Rating (
    rating_id INT PRIMARY KEY,
    movie_id INT,
    user_id INT,
    rating_date DATE,
    numeric_rating INT CHECK (numeric_rating BETWEEN 1 AND 10),
    verbal_rating VARCHAR(50),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserTable(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Revenue (
    revenue_id INT PRIMARY KEY,
    movie_id INT,
    investment DECIMAL(15,2),
    monthly_income DECIMAL(15,2),
    outcome_revenue DECIMAL(15,2),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Movie_Person_Relationships (
    movie_id INT,
    person_id INT,
    role VARCHAR(20) CHECK (role IN ('Actor','Director','Producer')),
    PRIMARY KEY (movie_id, person_id, role),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (person_id) REFERENCES Person(person_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Person VALUES
(1,'Leonardo DiCaprio','1974-11-11','M'),
(2,'Christopher Nolan','1970-07-30','M'),
(3,'James Cameron','1954-08-16','M'),
(4,'Kate Winslet','1975-10-05','F'),
(5,'Christian Bale','1974-01-30','M');

INSERT INTO Actor VALUES (1),(4),(5);
INSERT INTO Director VALUES (2),(3);
INSERT INTO Producer VALUES (2),(3);

INSERT INTO Movie VALUES
(1,'Inception','2010-07-16',8.8),
(2,'Interstellar','2014-11-07',8.6),
(3,'The Dark Knight','2008-07-18',9.0),
(4,'Avatar','2009-12-18',7.9),
(5,'Titanic','1997-12-19',7.8);

INSERT INTO Genre VALUES
(1,'Sci-Fi'),
(2,'Action'),
(3,'Drama'),
(4,'Romance'),
(5,'Thriller');

INSERT INTO Movie_Genre VALUES
(1,1),(1,2),(1,5),
(2,1),(2,3),
(3,2),(3,5),
(4,1),(4,3),
(5,3),(5,4);

INSERT INTO UserTable VALUES
(1,'user_alpha'),
(2,'user_beta'),
(3,'user_gamma'),
(4,'user_delta'),
(5,'user_epsilon');

INSERT INTO Rating VALUES
(1,1,1,'2023-01-10',9,'Excellent'),
(2,2,2,'2023-01-11',8,'Very Good'),
(3,3,3,'2023-01-12',10,'Outstanding'),
(4,4,4,'2023-01-13',7,'Good'),
(5,5,5,'2023-01-14',8,'Nice');

INSERT INTO Revenue VALUES
(1,1,160000000,20000000,830000000),
(2,2,165000000,25000000,677000000),
(3,3,185000000,30000000,1005000000),
(4,4,237000000,35000000,2923000000),
(5,5,200000000,40000000,2200000000);

INSERT INTO Movie_Person_Relationships VALUES
(1,1,'Actor'),
(1,2,'Director'),
(2,2,'Director'),
(3,2,'Director'),
(3,5,'Actor'),
(4,3,'Director'),
(5,3,'Director'),
(5,1,'Actor'),
(5,4,'Actor');

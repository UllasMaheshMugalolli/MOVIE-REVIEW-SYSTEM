-- =====================================================
-- STORED PROCEDURE AND FUNCTION
-- =====================================================

USE MovieDB;

-- =====================================================
-- STORED PROCEDURE - Calculate Movie Profit/Loss
-- =====================================================

DROP PROCEDURE IF EXISTS GetMovieProfit;
DELIMITER $$
CREATE PROCEDURE GetMovieProfit(IN in_movie_name VARCHAR(255))
BEGIN
  SELECT m.title,
         r.investment,
         r.outcome_revenue,
         (r.outcome_revenue - r.investment) AS profit_loss
  FROM Movie m
  JOIN Revenue r ON m.movie_id = r.movie_id
  WHERE m.title = in_movie_name;
END$$
DELIMITER ;

-- =====================================================
-- FUNCTION - Calculate Person's Age
-- =====================================================

DROP FUNCTION IF EXISTS GetPersonAge;
DELIMITER $$
CREATE FUNCTION GetPersonAge(p_person_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE dob DATE;
  DECLARE age INT;
  SELECT date_of_birth INTO dob FROM Person WHERE person_id = p_person_id;
  IF dob IS NULL THEN
    RETURN NULL;
  END IF;
  SET age = TIMESTAMPDIFF(YEAR, dob, CURDATE());
  RETURN age;
END$$
DELIMITER ;

-- =====================================================
-- TEST QUERIES
-- =====================================================

-- Test stored procedure
-- CALL GetMovieProfit('Inception');

-- Test function
-- SELECT GetPersonAge(1) AS age;

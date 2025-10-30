USE MovieDB;

-- Complete set of triggers to maintain avg_rating for all operations

-- 1. INSERT Trigger (fires when new rating is added)
DROP TRIGGER IF EXISTS trg_UpdateMovieAvgRating_AFTER_INSERT;
DELIMITER $$
CREATE TRIGGER trg_UpdateMovieAvgRating_AFTER_INSERT
AFTER INSERT ON Rating
FOR EACH ROW
BEGIN
  DECLARE avg_val DECIMAL(3,1);
  SELECT ROUND(AVG(numeric_rating),1) INTO avg_val FROM Rating WHERE movie_id = NEW.movie_id;
  UPDATE Movie SET avg_rating = IFNULL(avg_val,0) WHERE movie_id = NEW.movie_id;
END$$
DELIMITER ;

-- 2. UPDATE Trigger (fires when rating is modified)
DROP TRIGGER IF EXISTS trg_UpdateMovieAvgRating_AFTER_UPDATE;
DELIMITER $$
CREATE TRIGGER trg_UpdateMovieAvgRating_AFTER_UPDATE
AFTER UPDATE ON Rating
FOR EACH ROW
BEGIN
  DECLARE avg_val DECIMAL(3,1);
  SELECT ROUND(AVG(numeric_rating),1) INTO avg_val FROM Rating WHERE movie_id = NEW.movie_id;
  UPDATE Movie SET avg_rating = IFNULL(avg_val,0) WHERE movie_id = NEW.movie_id;
END$$
DELIMITER ;

-- 3. DELETE Trigger (fires when rating is removed)
DROP TRIGGER IF EXISTS trg_UpdateMovieAvgRating_AFTER_DELETE;
DELIMITER $$
CREATE TRIGGER trg_UpdateMovieAvgRating_AFTER_DELETE
AFTER DELETE ON Rating
FOR EACH ROW
BEGIN
  DECLARE avg_val DECIMAL(3,1);
  SELECT ROUND(AVG(numeric_rating),1) INTO avg_val FROM Rating WHERE movie_id = OLD.movie_id;
  UPDATE Movie SET avg_rating = IFNULL(avg_val,0) WHERE movie_id = OLD.movie_id;
END$$
DELIMITER ;

CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  type VARCHAR (15) NOT NULL,
  format VARCHAR (15) NOT NULL,
  media_url VARCHAR (255) NOT NULL,
  meta_data json
)

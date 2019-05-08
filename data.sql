CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    num_employees INTEGER,
    description text,
    logo_url text
);


CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary NUMERIC,
    equity FLOAT NOT NULL CHECK (equity<1),
    company_handle text NOT NULL REFERENCES companies, 
    date_posted timestamp without time zone DEFAULT NOW()
);


CREATE TABLE users (
    username text UNIQUE PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT FALSE 
);



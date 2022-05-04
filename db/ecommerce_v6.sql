--
-- PostgreSQL database dump
--

-- Dumped from database version 13.6 (Ubuntu 13.6-1.pgdg20.04+1)
-- Dumped by pg_dump version 14.1

-- Started on 2022-04-28 16:46:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 200 (class 1259 OID 41521399)
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: xczywuupswqjwp
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carts_id_seq OWNER TO xczywuupswqjwp;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 201 (class 1259 OID 41521401)
-- Name: carts; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.carts (
    cart_id integer DEFAULT nextval('public.carts_id_seq'::regclass) NOT NULL,
    user_id integer
);


ALTER TABLE public.carts OWNER TO xczywuupswqjwp;

--
-- TOC entry 202 (class 1259 OID 41521405)
-- Name: carts_products; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.carts_products (
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1
);


ALTER TABLE public.carts_products OWNER TO xczywuupswqjwp;

--
-- TOC entry 203 (class 1259 OID 41521409)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: xczywuupswqjwp
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO xczywuupswqjwp;

--
-- TOC entry 204 (class 1259 OID 41521411)
-- Name: categories; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.categories (
    category_id integer DEFAULT nextval('public.categories_id_seq'::regclass) NOT NULL,
    name character varying(50)
);


ALTER TABLE public.categories OWNER TO xczywuupswqjwp;

--
-- TOC entry 205 (class 1259 OID 41521415)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: xczywuupswqjwp
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO xczywuupswqjwp;

--
-- TOC entry 206 (class 1259 OID 41521417)
-- Name: orders; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.orders (
    order_id integer DEFAULT nextval('public.orders_id_seq'::regclass) NOT NULL,
    user_id integer,
    order_date timestamp without time zone,
    order_paid_for boolean,
    order_notes text,
    order_shipped timestamp without time zone,
    order_arrived timestamp without time zone,
    order_total_cost numeric
);


ALTER TABLE public.orders OWNER TO xczywuupswqjwp;

--
-- TOC entry 207 (class 1259 OID 41521424)
-- Name: orders_products; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.orders_products (
    order_id integer,
    product_id integer,
    quantity integer,
    total numeric
);


ALTER TABLE public.orders_products OWNER TO xczywuupswqjwp;

--
-- TOC entry 208 (class 1259 OID 41521430)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: xczywuupswqjwp
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO xczywuupswqjwp;

--
-- TOC entry 209 (class 1259 OID 41521432)
-- Name: products; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.products (
    product_id integer DEFAULT nextval('public.products_id_seq'::regclass) NOT NULL,
    name character varying(100),
    description text,
    price numeric,
    image_url character varying(100),
    in_stock boolean
);


ALTER TABLE public.products OWNER TO xczywuupswqjwp;

--
-- TOC entry 210 (class 1259 OID 41521439)
-- Name: products_categories; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.products_categories (
    product_id integer,
    category_id integer
);


ALTER TABLE public.products_categories OWNER TO xczywuupswqjwp;

--
-- TOC entry 211 (class 1259 OID 41521442)
-- Name: user_seq; Type: SEQUENCE; Schema: public; Owner: xczywuupswqjwp
--

CREATE SEQUENCE public.user_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_seq OWNER TO xczywuupswqjwp;

--
-- TOC entry 212 (class 1259 OID 41521444)
-- Name: users; Type: TABLE; Schema: public; Owner: xczywuupswqjwp
--

CREATE TABLE public.users (
    user_id integer DEFAULT nextval('public.user_seq'::regclass) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(100) NOT NULL,
    forename character varying(50),
    surname character varying(50),
    join_date timestamp without time zone,
    last_logon timestamp without time zone,
    enabled boolean,
    contact_number character varying(20),
    roles character varying(50) DEFAULT 'Customer'::character varying NOT NULL,
    google character varying,
    avatar_url character varying
);


ALTER TABLE public.users OWNER TO xczywuupswqjwp;

--
-- TOC entry 3885 (class 2606 OID 41521450)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 3887 (class 2606 OID 41521452)
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- TOC entry 3889 (class 2606 OID 41521454)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3891 (class 2606 OID 41521456)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3893 (class 2606 OID 41521458)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3895 (class 2606 OID 41521460)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3897 (class 2606 OID 41521462)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3898 (class 2606 OID 41521463)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3900 (class 2606 OID 41521468)
-- Name: orders_products orders_products_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.orders_products
    ADD CONSTRAINT orders_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 3901 (class 2606 OID 41521473)
-- Name: orders_products orders_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.orders_products
    ADD CONSTRAINT orders_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 3899 (class 2606 OID 41521478)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3902 (class 2606 OID 41521483)
-- Name: products_categories products_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.products_categories
    ADD CONSTRAINT products_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- TOC entry 3903 (class 2606 OID 41521488)
-- Name: products_categories products_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xczywuupswqjwp
--

ALTER TABLE ONLY public.products_categories
    ADD CONSTRAINT products_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 4039 (class 0 OID 0)
-- Dependencies: 668
-- Name: LANGUAGE plpgsql; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON LANGUAGE plpgsql TO xczywuupswqjwp;


-- Completed on 2022-04-28 16:47:08

--
-- PostgreSQL database dump complete
--


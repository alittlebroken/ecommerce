--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

-- Started on 2022-04-06 09:25:39

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
-- TOC entry 220 (class 1259 OID 41255)
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 24877)
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    cart_id integer DEFAULT nextval('public.carts_id_seq'::regclass) NOT NULL,
    user_id integer
);


--
-- TOC entry 221 (class 1259 OID 41259)
-- Name: carts_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts_products (
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1
);


--
-- TOC entry 219 (class 1259 OID 41253)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 211 (class 1259 OID 24889)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    category_id integer DEFAULT nextval('public.categories_id_seq'::regclass) NOT NULL,
    name character varying(50)
);


--
-- TOC entry 218 (class 1259 OID 41251)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 213 (class 1259 OID 24906)
-- Name: orders; Type: TABLE; Schema: public; Owner: -
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


--
-- TOC entry 214 (class 1259 OID 24923)
-- Name: orders_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders_products (
    order_id integer,
    product_id integer,
    quantity integer,
    total numeric
);


--
-- TOC entry 217 (class 1259 OID 41249)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 212 (class 1259 OID 24894)
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id integer DEFAULT nextval('public.products_id_seq'::regclass) NOT NULL,
    name character varying(100),
    description text,
    price numeric,
    image_url character varying(100),
    in_stock boolean
);


--
-- TOC entry 215 (class 1259 OID 24936)
-- Name: products_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_categories (
    product_id integer,
    category_id integer
);


--
-- TOC entry 216 (class 1259 OID 33058)
-- Name: user_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 209 (class 1259 OID 24865)
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    roles character varying(50) DEFAULT 'Customer'::character varying NOT NULL
);


--
-- TOC entry 3208 (class 2606 OID 24881)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 3210 (class 2606 OID 24883)
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- TOC entry 3212 (class 2606 OID 24893)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3216 (class 2606 OID 24912)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3214 (class 2606 OID 24900)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 3204 (class 2606 OID 49441)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3206 (class 2606 OID 24869)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3217 (class 2606 OID 24884)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3219 (class 2606 OID 24926)
-- Name: orders_products orders_products_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_products
    ADD CONSTRAINT orders_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 3220 (class 2606 OID 24931)
-- Name: orders_products orders_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_products
    ADD CONSTRAINT orders_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 3218 (class 2606 OID 24913)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3222 (class 2606 OID 24944)
-- Name: products_categories products_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_categories
    ADD CONSTRAINT products_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- TOC entry 3221 (class 2606 OID 24939)
-- Name: products_categories products_categories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_categories
    ADD CONSTRAINT products_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


-- Completed on 2022-04-06 09:25:39

--
-- PostgreSQL database dump complete
--


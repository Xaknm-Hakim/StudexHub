--
-- PostgreSQL database dump
--

\restrict 7jAHvFnSMdoBjC1UTJjpe0LucEk5RFq438u5kj8aVttnDqHryBG7vSOJfZJuWzr

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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
-- Name: AssignmentPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."AssignmentPriority" OWNER TO postgres;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'PENDING',
    'DONE'
);


ALTER TYPE public."AssignmentStatus" OWNER TO postgres;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'IN_APP',
    'EMAIL'
);


ALTER TYPE public."NotificationChannel" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ASSIGNMENT_DUE_TOMORROW',
    'ASSIGNMENT_DUE_TODAY',
    'CLASS_TOMORROW_SUMMARY'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Assignment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "courseId" text,
    priority public."AssignmentPriority" DEFAULT 'MEDIUM'::public."AssignmentPriority" NOT NULL,
    status public."AssignmentStatus" DEFAULT 'PENDING'::public."AssignmentStatus" NOT NULL
);


ALTER TABLE public."Assignment" OWNER TO postgres;

--
-- Name: ClassSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClassSchedule" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    location text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClassSchedule" OWNER TO postgres;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    "semesterId" text NOT NULL,
    code text,
    name text NOT NULL,
    credit integer NOT NULL,
    "gradePoint" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    mark integer
);


ALTER TABLE public."Course" OWNER TO postgres;

--
-- Name: InviteCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InviteCode" (
    id text NOT NULL,
    "codeHash" text NOT NULL,
    "attemptCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "lockedAt" timestamp(3) without time zone,
    "codeId" text NOT NULL
);


ALTER TABLE public."InviteCode" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "assignmentId" text,
    "assignmentTitleSnapshot" text,
    "courseNameSnapshot" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: NotificationDeliveryLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationDeliveryLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    "notificationDate" timestamp(3) without time zone NOT NULL,
    "assignmentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."NotificationDeliveryLog" OWNER TO postgres;

--
-- Name: Semester; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Semester" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    year integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    slot integer NOT NULL
);


ALTER TABLE public."Semester" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "passwordHash" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Assignment" (id, "userId", title, "dueDate", notes, "createdAt", "updatedAt", "completedAt", "courseId", priority, status) FROM stdin;
cmmu0u6gj000n2cnbggm6xbr9	cmmsk7q89000k2bmxsavm33qg	CYBER.SEC.	2026-03-22 00:00:00	LAB1(BFR 22/3:11:59)	2026-03-17 02:56:54.811	2026-03-17 02:57:27.525	\N	\N	HIGH	PENDING
cmmu61qmo000p2cnbmne4a4te	cmmrqxs6300002bmvlftf04t4	Assignment 1 | English For Career Development	2026-04-07 00:00:00	E-portfolio, LinkedIn, Resume, Cover letter, Personal gallery	2026-03-17 05:22:45.635	2026-03-17 05:22:45.635	\N	\N	HIGH	PENDING
cmmu7cftn00112cnbugk39alb	cmmrt1ewb00022bp2gzkn5ql8	Week 2 author | ECD	2026-03-28 00:00:00	Individual Task Author	2026-03-17 05:59:04.458	2026-03-17 06:03:13.537	\N	\N	MEDIUM	PENDING
cmmu7hemn00122cnbsa71eamh	cmmrt1ewb00022bp2gzkn5ql8	Assignment 1 | ECD	2026-04-07 00:00:00	E-portfolio, LinkedIn, Resume, Cover Letter, Personal Gallery	2026-03-17 06:02:56.186	2026-03-17 06:03:17.937	\N	\N	HIGH	PENDING
cmmvrukoy001r2cnb098b24uu	cmmrt1ewb00022bp2gzkn5ql8	Week 2 | FIS FOC 1	2026-03-29 00:00:00	A3 poster Infrographic	2026-03-18 08:20:49.073	2026-03-18 08:20:49.073	\N	\N	MEDIUM	PENDING
cmn6wa7kt000n2aqj13r8wxmn	cmmrt1ewb00022bp2gzkn5ql8	Week 2 | DAT21603	2026-03-29 00:00:00	Individual Task Author	2026-03-26 03:10:24.973	2026-03-26 03:10:24.973	\N	\N	MEDIUM	PENDING
cmn6wbpr1000o2aqjod0zmtp4	cmmrt1ewb00022bp2gzkn5ql8	Week 2 | DAT11503	2026-04-01 00:00:00	Individual Task Author	2026-03-26 03:11:35.182	2026-03-26 03:11:35.182	\N	\N	MEDIUM	PENDING
cmn6wcmwb000p2aqjse6pm2ec	cmmrt1ewb00022bp2gzkn5ql8	Week 2 | DAT22003	2026-03-29 00:00:00	Individual Task Author	2026-03-26 03:12:18.151	2026-03-26 03:12:18.151	\N	\N	MEDIUM	PENDING
\.


--
-- Data for Name: ClassSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClassSchedule" (id, "userId", title, "dayOfWeek", "startTime", "endTime", location, "isActive", "createdAt", "updatedAt") FROM stdin;
cmmsb3p6l00092bmxdehuwyme	cmmrt1ewb00022bp2gzkn5ql8	ENGLISH FOR CARRER DEVELOPMENT	2	11:00	14:00	BK5	t	2026-03-15 22:08:42.813	2026-03-15 22:08:42.813
cmmssgx3u00012cnby4bnlw2w	cmmssd27y00002cnbiupgz7s8	ENGINEER MATHEMATICS	1	11:00	13:00	MAKMAL JALUR LEBAR TANPA WAYAR	t	2026-03-16 06:14:53.082	2026-03-16 06:15:09.823
cmmsskyfk00022cnb6uuc7jjh	cmmssd27y00002cnbiupgz7s8	CIRCUIT ANALYSIS	1	14:00	18:00	MAKMAL KEJURUTERAAN ELETRIK 1	t	2026-03-16 06:18:01.424	2026-03-16 06:18:01.424
cmmssol2500032cnbfipeltwi	cmmssd27y00002cnbiupgz7s8	ELETRONIC DIGITS	2	09:00	11:00	MAKMAL JALUR LEBAR TANPA WAYAR	t	2026-03-16 06:20:50.717	2026-03-16 06:20:50.717
cmmssr51600072cnb5qevg9nf	cmmssd27y00002cnbiupgz7s8	COMPUTER PROGRAMMING	3	08:00	13:00	MAKMAL KEJURUTERAAN ELETRIK	t	2026-03-16 06:22:49.914	2026-03-16 06:23:17.238
cmmstmus8000f2cnb5s6bo8tb	cmmssd27y00002cnbiupgz7s8	ELTRONIC DIGITS	3	14:00	17:00	MTED 1	t	2026-03-16 06:47:29.623	2026-03-16 06:47:29.623
cmmstpbdj000g2cnba3x9kocd	cmmssd27y00002cnbiupgz7s8	ENGINEER MATHEMATICS	5	08:00	10:00	DEWAN KULIAH 2	t	2026-03-16 06:49:24.439	2026-03-16 06:49:24.439
cmmu63pwf000q2cnbwv9pzuxd	cmmrqxs6300002bmvlftf04t4	DAT12803 SYSTEM ANALYSIS AND DESIGN	1	10:00	12:00	MLKM 2	t	2026-03-17 05:24:18.015	2026-03-17 05:24:18.015
cmmu65aza000r2cnbtgflaozd	cmmrqxs6300002bmvlftf04t4	DAT21603 INTELLIGENT USER EXPERIENCE DESIGN	1	12:00	14:00	MLKM 2	t	2026-03-17 05:25:31.99	2026-03-17 05:25:31.99
cmmu66vwc000s2cnb3jx0zm7w	cmmrqxs6300002bmvlftf04t4	UHB23002 ENGLISH FOR CAREER DEVELOPMENT	2	11:00	14:00	BK5	t	2026-03-17 05:26:45.756	2026-03-17 05:26:45.756
cmmu684np000t2cnb8uj0vh64	cmmrqxs6300002bmvlftf04t4	DAT11503 PROGRAMMING FUNDAMENTAL	2	15:00	17:00	PG-MGA	t	2026-03-17 05:27:43.765	2026-03-17 05:27:43.765
cmmu69mht000u2cnbtnxrlsr5	cmmrqxs6300002bmvlftf04t4	DAT12803 SYSTEM ANALYSIS AND DESIGN	3	08:00	10:00	PG-MPD2	t	2026-03-17 05:28:53.537	2026-03-17 05:28:53.537
cmmu6ahzu000v2cnbckenrwnd	cmmrqxs6300002bmvlftf04t4	DAT22003 CYBERSECURITY FUNDAMENTALS	3	10:00	12:00	PD-MGA	t	2026-03-17 05:29:34.362	2026-03-17 05:29:34.362
cmmu6bl71000w2cnbfp2bbr3u	cmmrqxs6300002bmvlftf04t4	DAT11203 ALGEBRA AND CALCULUS	4	08:00	10:00	MLKM2	t	2026-03-17 05:30:25.165	2026-03-17 05:30:25.165
cmmu6ca3n000x2cnb80spufrh	cmmrqxs6300002bmvlftf04t4	DAT21603 INTELLIGENT USER EXPERIENCE DESIGN	4	10:00	12:00	PG-MPD1	t	2026-03-17 05:30:57.443	2026-03-17 05:30:57.443
cmmu6daul000y2cnb5ssm7kgf	cmmrqxs6300002bmvlftf04t4	DAT11503 PROGRAMMING FUNDAMENTAL	4	14:00	16:00	MLKM 2	t	2026-03-17 05:31:45.068	2026-03-17 05:31:51.001
cmmu6fnhw000z2cnb9aa3l90r	cmmrqxs6300002bmvlftf04t4	DAT22003 CYBERSECURITY FUNDAMENTALS	5	08:00	10:00	4-GS	t	2026-03-17 05:33:34.772	2026-03-17 05:33:34.772
cmmu6ggit00102cnbpvd8cjdh	cmmrqxs6300002bmvlftf04t4	DAT11203 ALGEBRA AND CALCULUS	5	10:00	12:00	GSS1 (FAST)	t	2026-03-17 05:34:12.389	2026-03-17 05:34:12.389
cmmsayti100062bmx50r65vip	cmmrt1ewb00022bp2gzkn5ql8	ALGEBRA AND CALCULUS (K)	1	08:00	10:00	MLKM 2	t	2026-03-15 22:04:55.129	2026-03-17 23:54:57.807
cmmsb04sw00072bmxx4naa3ru	cmmrt1ewb00022bp2gzkn5ql8	CYBERSECURITY FUNDEMENTALS (LAB)	1	10:00	12:00	MPD 1	t	2026-03-15 22:05:56.432	2026-03-17 23:55:14.873
cmmsb1qay00082bmxjiw0pnd8	cmmrt1ewb00022bp2gzkn5ql8	SYSTEM ANALYSIS DESIGN (K)	1	14:00	16:00	MLKM 2	t	2026-03-15 22:07:10.954	2026-03-17 23:55:26.827
cmmsb61t1000a2bmxrsz74n7v	cmmrt1ewb00022bp2gzkn5ql8	INTELLIGENT USER EXPERIENCE DESIGN (K)	3	08:00	10:00	MLKM 2	t	2026-03-15 22:10:32.485	2026-03-17 23:55:41.54
cmmsb7ctp000b2bmx78l8suok	cmmrt1ewb00022bp2gzkn5ql8	PROGRAMMING FUNDEMENTALS (LAB)	3	10:00	12:00	MPD 2	t	2026-03-15 22:11:33.421	2026-03-17 23:55:49.35
cmmsb8v9p000c2bmxvh6pb4ud	cmmrt1ewb00022bp2gzkn5ql8	FALSAFAH DAN ISU SEMASA (K)	3	16:00	18:00	DK 3	t	2026-03-15 22:12:43.981	2026-03-17 23:56:02.214
cmmsbami1000d2bmxsmh4boq7	cmmrt1ewb00022bp2gzkn5ql8	SYSTEM ANALYSIS DESIGN (LAB)	4	08:00	10:00	MPD 1	t	2026-03-15 22:14:05.929	2026-03-17 23:56:29.385
cmmsbbsxs000e2bmx5r5ef5nc	cmmrt1ewb00022bp2gzkn5ql8	INTELLIGENT USER EXPERIENCE DESIGN (LAB)	4	10:00	12:00	MBK	t	2026-03-15 22:15:00.928	2026-03-17 23:56:40.731
cmmsbd5ln000f2bmx6m5hcj8x	cmmrt1ewb00022bp2gzkn5ql8	PROGRAMMING FUNDEMENTALS (K)	4	16:00	18:00	AUDI 4	t	2026-03-15 22:16:03.995	2026-03-17 23:56:49.327
cmmsbeygs000g2bmxkebszsjl	cmmrt1ewb00022bp2gzkn5ql8	ALGEBRA AND CALCULUS (TUTO)	5	08:00	10:00	W-GSS 1 (FAST)	t	2026-03-15 22:17:28.06	2026-03-17 23:57:09.209
cmmsbg17u000h2bmxpi0y2mdt	cmmrt1ewb00022bp2gzkn5ql8	CYBERSECURITY FUNDEMENTALS (K)	5	10:00	12:00	MLKM 2	t	2026-03-15 22:18:18.282	2026-03-17 23:57:19.684
cmmvmy4hm001q2cnb8ipg5xge	cmmrqxs6300002bmvlftf04t4	UQP10101 PUBLIC SPEAKING S2	5	15:00	17:00	PBL 5	t	2026-03-18 06:03:36.634	2026-03-18 06:03:36.634
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Course" (id, "semesterId", code, name, credit, "gradePoint", "createdAt", "updatedAt", mark) FROM stdin;
cmmrtb3r400042bp21mhv5c1x	cmmrtb3qp00032bp211ih7jav	UQU11402	KIAR	2	3.82	2026-03-15 13:50:35.197	2026-03-15 13:50:35.197	77
cmmrtbzz900052bp2piobm5i1	cmmrtb3qp00032bp211ih7jav	UHB11502	BASIC FRENCH	2	3.3	2026-03-15 13:51:16.965	2026-03-15 13:51:16.965	70
cmmrtdn8m00062bp2r2f5yb6h	cmmrtb3qp00032bp211ih7jav	DAT10003	ETHICS AND SAFETY	3	3.94	2026-03-15 13:52:33.766	2026-03-15 13:52:33.766	79
cmmrteqr600082bp2v3wu4x9m	cmmrteqqs00072bp28xmzlv8h	UQW10501	TECHNO ENTREPRENEUR	1	4	2026-03-15 13:53:24.976	2026-03-15 13:53:24.976	83
cmmrtf5nd00092bp22137tlyb	cmmrteqqs00072bp28xmzlv8h	UQI10402	ISLAM	2	3.12	2026-03-15 13:53:44.28	2026-03-15 13:53:44.28	67
cmmrtfw1e000a2bp2j5v74tdc	cmmrteqqs00072bp28xmzlv8h	UHB13002	ENGLISH	2	4	2026-03-15 13:54:18.481	2026-03-15 13:54:18.481	83
cmmrtht4e000b2bp212eq7ex8	cmmrteqqs00072bp28xmzlv8h	DAT11103	ALGORITHM DESIGN	3	4	2026-03-15 13:55:48.013	2026-03-15 13:55:48.013	83
cmmrtj8ol000c2bp2pm1i3l6n	cmmrteqqs00072bp28xmzlv8h	DAT11003	NETWORK AND DATA COMMUNICATION	3	3.88	2026-03-15 13:56:54.835	2026-03-15 13:56:54.835	78
cmmrtko3h000d2bp2ecckzqp4	cmmrteqqs00072bp28xmzlv8h	DAT10903	OPERATING SYSTEM	3	4	2026-03-15 13:58:01.468	2026-03-15 13:58:01.468	85
cmmrtlopb000e2bp2j9b0jwy0	cmmrteqqs00072bp28xmzlv8h	DAT10703	COMPUTER ARCHITECTURE	3	3.82	2026-03-15 13:58:48.91	2026-03-15 13:58:48.91	77
cmmrtmxdf000f2bp2bee89wvd	cmmrteqqs00072bp28xmzlv8h	DAT10203	DISCRETE MATH	3	4	2026-03-15 13:59:46.802	2026-03-15 13:59:46.802	81
cmmskc4d7000m2bmxnnwcqmpz	cmmskc4cu000l2bmxoea0gshs	AA	CA	3	4	2026-03-16 02:27:12.281	2026-03-16 02:27:12.281	82
cmmskcoyr000n2bmx8nsvqogw	cmmskc4cu000l2bmxoea0gshs	AA	DM	3	4	2026-03-16 02:27:38.978	2026-03-16 02:27:38.978	81
cmmske1od000o2bmxxn3alyij	cmmskc4cu000l2bmxoea0gshs	AA	OS	3	4	2026-03-16 02:28:42.108	2026-03-16 02:28:42.108	81
cmmskerlf000p2bmxuitwxnvv	cmmskc4cu000l2bmxoea0gshs	AA	NET	3	4	2026-03-16 02:29:15.698	2026-03-16 02:29:15.698	80
cmmskgkll000q2bmx7yuq06uy	cmmskc4cu000l2bmxoea0gshs	AA	AD	3	3.54	2026-03-16 02:30:39.936	2026-03-16 02:30:39.936	73
cmmskh2il000r2bmxmrhuq9aj	cmmskc4cu000l2bmxoea0gshs	AA	ENG	2	3.06	2026-03-16 02:31:03.164	2026-03-16 02:31:03.164	66
cmmskheom000s2bmx1wl9mtlb	cmmskc4cu000l2bmxoea0gshs	AA	ISLAMIC	2	2.82	2026-03-16 02:31:18.933	2026-03-16 02:31:18.933	62
cmmskhtf3000t2bmx2m5ce18k	cmmskc4cu000l2bmxoea0gshs	AA	AW	1	4	2026-03-16 02:31:38.03	2026-03-16 02:31:38.03	80
cmmssq6wd00052cnbkv7hl4d7	cmmssq6vk00042cnbj00mlk8n	UQP10101	PUBLIC SPEAKING	1	\N	2026-03-16 06:22:05.672	2026-03-16 06:22:05.672	\N
cmmssqshv00062cnbz1a9bek9	cmmssq6vk00042cnbj00mlk8n	UQI11402	FALSAFAH DAN ISU SEMASA	2	\N	2026-03-16 06:22:33.667	2026-03-16 06:22:33.667	\N
cmmssrg9a00082cnbbpfcttr3	cmmssq6vk00042cnbj00mlk8n	UHB23002	ENGLISH FOR CAREER DEVELOPMENT	2	\N	2026-03-16 06:23:04.46	2026-03-16 06:23:04.46	\N
cmmsssdky00092cnb3dapfii3	cmmssq6vk00042cnbj00mlk8n	DAT22003	CYBERSECURITY FUNDEMENTALS	3	\N	2026-03-16 06:23:47.65	2026-03-16 06:23:47.65	\N
cmmssteds000a2cnb5pi4r25f	cmmssq6vk00042cnbj00mlk8n	DAT21603	INTELLIGENT USER EXPERIENCE DESIGN	3	\N	2026-03-16 06:24:35.343	2026-03-16 06:24:35.343	\N
cmmssu5gf000b2cnbm2qmuwxp	cmmssq6vk00042cnbj00mlk8n	DAT11503	PROGRAMMING FUNDEMENTALS	3	\N	2026-03-16 06:25:10.43	2026-03-16 06:25:10.43	\N
cmmssuutp000c2cnbu3j01evt	cmmssq6vk00042cnbj00mlk8n	DAT11203	ALGEBRA AND CALCULUS	3	\N	2026-03-16 06:25:43.307	2026-03-16 06:25:43.307	\N
cmmssvbiz000d2cnb0t4omj5d	cmmssq6vk00042cnbj00mlk8n	DAT10803	SYSTEM ANALYSIS AND DESIGN	3	\N	2026-03-16 06:26:04.954	2026-03-16 06:26:04.954	\N
cmmvmg6dg001e2cnbam8p4jsf	cmmvmg6d4001d2cnb942yaku0	DAT10003	ETHICS AND SAFETY IN COMPUTING	3	3.7	2026-03-18 05:49:39.267	2026-03-18 05:49:39.267	75
cmmvmgn9n001f2cnbddmsgbsq	cmmvmg6d4001d2cnb942yaku0	UHB11502	BASIC FRENCH	2	3.24	2026-03-18 05:50:01.162	2026-03-18 05:50:01.162	69
cmmvmhz8l001i2cnbedlhy4el	cmmvmhz8b001h2cnbr19wvm41	UQI10402	INTRODUCTION TO ISLAMIC STUDIES	2	3.3	2026-03-18 05:51:03.332	2026-03-18 05:51:03.332	70
cmmvmib8a001j2cnb0u4nhxfu	cmmvmhz8b001h2cnbr19wvm41	UQB11201	THEATRE	1	4	2026-03-18 05:51:18.874	2026-03-18 05:51:18.874	95
cmmvmirdg001k2cnbn9q0vhsp	cmmvmhz8b001h2cnbr19wvm41	UHB13002	INTRODUCTION TO ENGLISH COMMUNICATION	2	3.12	2026-03-18 05:51:39.796	2026-03-18 05:51:39.796	67
cmmvmh209001g2cnbyrf7p9rj	cmmvmg6d4001d2cnb942yaku0	UQU11402	INTEGRITY AND ANTI CORRUPTION	2	4	2026-03-18 05:50:20.264	2026-03-18 05:51:52.087	81
cmmvmmheo001l2cnbevbm1vuu	cmmvmhz8b001h2cnbr19wvm41	DAT11103	ALGORITHM DESIGN	3	3.88	2026-03-18 05:54:33.503	2026-03-18 05:54:33.503	78
cmmvmne9m001m2cnbprl21uba	cmmvmhz8b001h2cnbr19wvm41	DAT11003	NETWORK AND DATA COMMUNICATION	3	4	2026-03-18 05:55:16.09	2026-03-18 05:55:16.09	87
cmmvmoi6x001n2cnbmshia0x8	cmmvmhz8b001h2cnbr19wvm41	DAT10903	OPERATING SYSTEMS	3	4	2026-03-18 05:56:07.833	2026-03-18 05:56:07.833	83
cmmvmp7ll001o2cnbrua5fuie	cmmvmhz8b001h2cnbr19wvm41	DAT10703	COMPUTER ARCHITECTURE	3	3.82	2026-03-18 05:56:40.761	2026-03-18 05:56:40.761	77
cmmvmpyux001p2cnb97yl7u35	cmmvmhz8b001h2cnbr19wvm41	DAT10203	DISCRETE MATHEMATICS	3	4	2026-03-18 05:57:16.088	2026-03-18 05:57:16.088	80
\.


--
-- Data for Name: InviteCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InviteCode" (id, "codeHash", "attemptCount", "createdAt", "expiresAt", "usedAt", "lockedAt", "codeId") FROM stdin;
cmmrqx0oy00003imvzs24mn59	971bd7c26f4a2d5bfb58056799cda004e6cc8592c03926925aecb8a91073abc9	0	2026-03-15 12:43:38.817	2026-03-16 12:43:38.582	2026-03-15 12:44:14.088	\N	JUW8E7
cmmrt0c1h00003hp232l1m7gk	99e95b068b3be2a2b72b91fae132da17d44347fa1a263b4f5b9fddc54e6f6fe5	0	2026-03-15 13:42:12.724	2026-03-16 13:42:12.492	2026-03-15 13:43:02.759	\N	QYU28M
cmmrzvvdn00003pmxxb7flc6b	745d03a81945e66f56ece735825055eb402c3d6a72104d6aae913bc51fb4369a	0	2026-03-15 16:54:41.818	2026-03-16 16:54:41.573	2026-03-15 17:06:23.147	\N	X3C44B
cmms0dxsl000058mx8kewgyid	af60b86a2158d86488b805131d9639db199f207249631180506089c936a8c53e	0	2026-03-15 17:08:44.756	2026-03-16 17:08:44.518	2026-03-15 17:09:43.578	\N	TVGQE7
cmmsk4toy00006lmxiouejgfz	7acc444a5ea263c327aa8d77a781336671e7e7843f4e410fb6faa724f18530ad	0	2026-03-16 02:21:31.857	2026-03-17 02:21:31.621	2026-03-16 02:23:47.02	\N	RWMLV3
cmmskoi8g00007omxhmiqscdz	91cd53473827844109434f327d80513d3fd236ef949b08a51030c352a0293abc	0	2026-03-16 02:36:50.127	2026-03-17 02:36:49.891	2026-03-16 02:46:14.767	\N	KXR9Z8
cmmsl1ixh00008rmxpdxtmjdv	177dbf03c1f08661ef450646b06bf8068cfefaae2a42ed3ce43193e90059c41f	0	2026-03-16 02:46:57.556	2026-03-17 02:46:57.32	2026-03-16 02:53:13.618	\N	FDJCTE
cmmsleebu00009umxfq8f6jdo	7ad9241ce9aed5152a6d4fd96040c45487708935573cbfbfeb539987e0f07882	0	2026-03-16 02:56:58.121	2026-03-17 02:56:57.883	2026-03-16 02:58:13.354	\N	ANT3JU
cmmssc0ee00003inbap8f0vrc	24e0aa79bcbf8ee3c8bc1c6a0feac2ad4f782969ca0adc71b4cdc47f35ee0880	0	2026-03-16 06:11:04.068	2026-03-17 06:11:03.836	2026-03-16 06:11:52.734	\N	63E7SN
cmmsse38w000050nbkhsxjud4	bd6dd79576b381f452a75a99d0f57ef020b4a270a44efaf238bfe4aeb7e2c064	0	2026-03-16 06:12:41.071	2026-03-17 06:12:40.836	\N	\N	RWSKJP
cmmst6fcn000063nbnl8v3pdi	e60c2b572bba8b265d7b3f033d8c5170f580c85ab3ee8e2929c162458406f8da	0	2026-03-16 06:34:43.126	2026-03-17 06:34:42.882	2026-03-16 06:35:08.338	\N	G69D27
cmmtaib7q00007snb5pfbx8mb	deddccab708f0f44a0cab42c0528824a2fd82db3f242f00f092c23365cd3c85d	0	2026-03-16 14:39:51.109	2026-03-17 14:39:50.869	2026-03-16 14:40:43.096	\N	YCXCHU
cmmtco5qe00008vnbqrlqxf8f	53bde789e5084a417c72f3726fd9afb0c960a96253c9f4f25de1671cecd97df5	0	2026-03-16 15:40:23.173	2026-03-17 15:40:22.926	2026-03-16 15:41:32.525	\N	6CBE4H
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", type, title, message, "isRead", "assignmentId", "assignmentTitleSnapshot", "courseNameSnapshot", "createdAt") FROM stdin;
cmmtuioz3000l2cnb5xpiy8ny	cmmssd27y00002cnbiupgz7s8	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 2 classes tomorrow: COMPUTER PROGRAMMING at 08:00 (MAKMAL KEJURUTERAAN ELETRIK), ELTRONIC DIGITS at 14:00 (MTED 1).	f	\N	\N	\N	2026-03-17 00:00:01.263
cmn6phe35000i2aqjzictwhfp	cmmrqxs6300002bmvlftf04t4	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 3 classes tomorrow: DAT22003 CYBERSECURITY FUNDAMENTALS at 08:00 (4-GS), DAT11203 ALGEBRA AND CALCULUS at 10:00 (GSS1 (FAST)), UQP10101 PUBLIC SPEAKING S2 at 15:00 (PBL 5).	t	\N	\N	\N	2026-03-26 00:00:02.705
cmmwpeeb300002bo61iucabh0	cmmssd27y00002cnbiupgz7s8	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 1 class tomorrow: ENGINEER MATHEMATICS at 08:00 (DEWAN KULIAH 2).	f	\N	\N	\N	2026-03-19 00:00:01.262
cmn3ulnyc00002aqjrg72f4yj	cmmssd27y00002cnbiupgz7s8	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 2 classes tomorrow: COMPUTER PROGRAMMING at 08:00 (MAKMAL KEJURUTERAAN ELETRIK), ELTRONIC DIGITS at 14:00 (MTED 1).	f	\N	\N	\N	2026-03-24 00:00:01.667
cmn6phe2u000g2aqjwoipdk9w	cmmssd27y00002cnbiupgz7s8	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 1 class tomorrow: ENGINEER MATHEMATICS at 08:00 (DEWAN KULIAH 2).	f	\N	\N	\N	2026-03-26 00:00:02.694
cmn6phe3g000k2aqjq25ieroq	cmmrt1ewb00022bp2gzkn5ql8	CLASS_TOMORROW_SUMMARY	Tomorrow's Classes	You have 2 classes tomorrow: ALGEBRA AND CALCULUS (TUTO) at 08:00 (W-GSS 1 (FAST)), CYBERSECURITY FUNDEMENTALS (K) at 10:00 (MLKM 2).	f	\N	\N	\N	2026-03-26 00:00:02.716
\.


--
-- Data for Name: NotificationDeliveryLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationDeliveryLog" (id, "userId", type, channel, "notificationDate", "assignmentId", "createdAt") FROM stdin;
cmn5a1ioc00072aqjdn8ourut	cmmrqxs6300002bmvlftf04t4	CLASS_TOMORROW_SUMMARY	IN_APP	2026-03-24 16:00:00	\N	2026-03-25 00:00:01.74
cmn5a1ioj00092aqjiazgvb3s	cmmrt1ewb00022bp2gzkn5ql8	CLASS_TOMORROW_SUMMARY	IN_APP	2026-03-24 16:00:00	\N	2026-03-25 00:00:01.747
cmn6phdck000e2aqjy8lvqmqo	cmmrt1ewb00022bp2gzkn5ql8	ASSIGNMENT_DUE_TOMORROW	IN_APP	2026-03-25 16:00:00	cmmva614q00182cnbgpqfp61r	2026-03-26 00:00:01.748
cmn6phe2c000f2aqjzbld4pen	cmmrt1ewb00022bp2gzkn5ql8	ASSIGNMENT_DUE_TOMORROW	EMAIL	2026-03-25 16:00:00	cmmva614q00182cnbgpqfp61r	2026-03-26 00:00:02.676
cmn6phe2y000h2aqj1hml7gh9	cmmssd27y00002cnbiupgz7s8	CLASS_TOMORROW_SUMMARY	IN_APP	2026-03-25 16:00:00	\N	2026-03-26 00:00:02.698
cmn6phe38000j2aqjk689vlsc	cmmrqxs6300002bmvlftf04t4	CLASS_TOMORROW_SUMMARY	IN_APP	2026-03-25 16:00:00	\N	2026-03-26 00:00:02.708
cmn6phe3k000l2aqjhvalp9bg	cmmrt1ewb00022bp2gzkn5ql8	CLASS_TOMORROW_SUMMARY	IN_APP	2026-03-25 16:00:00	\N	2026-03-26 00:00:02.72
\.


--
-- Data for Name: Semester; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Semester" (id, "userId", name, year, "createdAt", "updatedAt", slot) FROM stdin;
cmmrtb3qp00032bp211ih7jav	cmmrt1ewb00022bp2gzkn5ql8	Special Semester	\N	2026-03-15 13:50:35.184	2026-03-15 13:50:35.184	0
cmmrteqqs00072bp28xmzlv8h	cmmrt1ewb00022bp2gzkn5ql8	Year 1 Semester 1	\N	2026-03-15 13:53:24.964	2026-03-15 13:53:24.964	1
cmmskc4cu000l2bmxoea0gshs	cmmsk7q89000k2bmxsavm33qg	Special Semester	\N	2026-03-16 02:27:12.27	2026-03-16 02:27:12.27	0
cmmssq6vk00042cnbj00mlk8n	cmmrt1ewb00022bp2gzkn5ql8	Year 1 Semester 2	\N	2026-03-16 06:22:05.648	2026-03-16 06:22:05.648	2
cmmvmg6d4001d2cnb942yaku0	cmmrqxs6300002bmvlftf04t4	Special Semester	\N	2026-03-18 05:49:39.256	2026-03-18 05:49:39.256	0
cmmvmhz8b001h2cnbr19wvm41	cmmrqxs6300002bmvlftf04t4	Year 1 Semester 1	\N	2026-03-18 05:51:03.323	2026-03-18 05:51:03.323	1
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, "passwordHash", "createdAt", "updatedAt") FROM stdin;
cmmrqxs6300002bmvlftf04t4	hakimz.7117@gmail.com	Xaknm	$2b$12$Vv17pAdb6D9BqrrSf/oJhOY8FGlE7pmxq95UnWgtR2t2qKyKLkGr2	2026-03-15 12:44:14.427	2026-03-15 12:44:14.427
cmmrt1ewb00022bp2gzkn5ql8	aizuddin1024@gmail.com	Zerpo	$2b$12$ALihRCNZYs.fmqYuDLkuSup8NaWbj5rDmwziHLdSWuBm0MJ2t6UFW	2026-03-15 13:43:03.083	2026-03-15 13:43:03.083
cmms0awsr00042bmx2wk4u14d	afhamfauzy01@gmail.com	apam	$2b$12$FyG7k7sG/ouwgIHW7arxmuAKHFfRBdS2taKf3hWM4b0AxsxN5b2BC	2026-03-15 17:06:23.499	2026-03-15 17:06:23.499
cmms0f7fm00052bmxcwqj1g1v	hakimihussein1907@gmail.com	kimi	$2b$12$PfRiNvGld6NURye7oi1X2uz0T0JkFIWt6g1NaZkKKe999UYmb3d7.	2026-03-15 17:09:43.906	2026-03-15 17:09:43.906
cmmsk7q89000k2bmxsavm33qg	ammar.taib31@gmail.com	aMMArCUTE	$2b$12$4riJW50Xh/LriuI6FkxF9.IJEPh4vlFfNt4aTmDrU/jcjlgrsGn.W	2026-03-16 02:23:47.337	2026-03-16 02:23:47.337
cmmsl0m66000u2bmxeatkytjy	azriarshad1977@gmail.com	Muhammad_Azri07	$2b$12$C.NMhpSfvVXB0HEMNfMoUu0TzYTUGGqU9mRQ6DOdFhmKVgbumChSW	2026-03-16 02:46:15.101	2026-03-16 02:46:15.101
cmmsl9lcd000v2bmxoap6mfuf	mustaffalmusyrif@gmail.com	Mucip Uchiha	$2b$12$xgYsLtamNok0ked5vJqnEOM/f16NdP2LFMi2V1k5UOUxbaEXFAAAa	2026-03-16 02:53:13.933	2026-03-16 02:53:13.933
cmmslg0me000w2bmxt3zyvamq	afiqmuqrish6@gmail.com	AFIQ MUQRISH BIN RAZALI	$2b$12$eusU.Zghc0bCRv0QpgPFF.W7CImnC49J2hrOKO6EpuX7hyb7H/gUq	2026-03-16 02:58:13.67	2026-03-16 02:58:13.67
cmmssd27y00002cnbiupgz7s8	aw135nuz@gmail.com	amir imuet handsome ganteng	$2b$12$cFYigcMr0bTm0Zx89/.NQ.yKEu7/wJpB/cOMHaEiwTWE1Qlsvp1U2	2026-03-16 06:11:53.086	2026-03-16 06:11:53.086
cmmst6z1p000e2cnbuh6l2p0p	fazaimantrw@gmail.com	Pajai	$2b$12$nb9TPQbGgvYPQdTKX4Un0O5pBLTbx80spk4oP6axV4rnfXMT2RAOm	2026-03-16 06:35:08.653	2026-03-16 06:35:08.653
cmmtajfkm000h2cnbvqmpzz9w	fahmilugi@gmail.com	Faiz	$2b$12$gRhcPb0cg1p5nuwzk.D4l.T5ZgYeNXeZvRnkGjmYqSIw/...QYuv2	2026-03-16 14:40:43.413	2026-03-16 14:40:43.413
cmmtcpnhk000i2cnbisw3luap	hakimkiki542@gmail.com	Hakim	$2b$12$QYY7paM3ry81u0s4xA23AelBP1k.sE3d3KFgPSlqzNAqcJ0KO5UEi	2026-03-16 15:41:32.84	2026-03-16 15:41:32.84
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2124f079-b901-463b-9bd1-b8400b5be0cd	6ec4c0adb6e94e90f17d08f47f273a6a8279b96311a205f578f0290d605b76c8	2026-03-15 17:29:36.7865+08	20260224104411_init	\N	\N	2026-03-15 17:29:36.7202+08	1
8c478585-6f28-428e-bb07-daae36007ae2	1b720230c24e29867895f6ffb25f402bc26a1d3ca0f55629353d16c6d1435778	2026-03-15 17:29:36.803417+08	20260225025917_add_invite_code	\N	\N	2026-03-15 17:29:36.787859+08	1
00fdffee-7f9a-4c37-b674-3ec76cf15ec1	c4a8ac7f1fb0bab5634183271533b1f8a95b529013b0e12e562015d19f2d0aef	2026-03-15 17:29:36.820137+08	20260225050523_invitecode_codeid	\N	\N	2026-03-15 17:29:36.804646+08	1
b58ca93c-8f68-4dfe-8d01-ca31f73f24e8	6e46a7d160576b5abf20aa6cfb6131d008e64427f37f513f8739767b78b6b455	2026-03-15 17:29:36.843521+08	20260228045308_assignments_upgrade	\N	\N	2026-03-15 17:29:36.82137+08	1
bfed5a79-9d49-4e62-9db6-da2c0bb97dfc	5e3448770c3c53eac2363b93cdb3d6914a799fb63ff5ea93835bd7aeea67d8e9	2026-03-15 17:29:36.849198+08	20260228090457_updating_course_schema	\N	\N	2026-03-15 17:29:36.844726+08	1
fb17af63-f927-4eb0-b1db-f0fdd270ba34	0f5b39ebe324bf9ca4e3ce122fac937cb3d7dd3a587da7cfaf8fb278498ac0dd	2026-03-15 17:29:36.870185+08	20260306080311_add_class_schedule_and_editting_user	\N	\N	2026-03-15 17:29:36.85044+08	1
440b8d9f-cc32-4851-a65a-28dabd53fced	d43f68fa5204c3b384b7ee6a80d1caae685d9f1bd2c585a542e613407ea29e17	2026-03-15 17:29:36.924396+08	20260306093406_add_notifications	\N	\N	2026-03-15 17:29:36.871702+08	1
3fcc828f-1c8b-474d-b84f-4dbe93a59c96	0e9d32e809fbe9e8ffecd855ea204559c907eacb27b4ae28450366bdfba41746	2026-03-15 17:29:36.93456+08	20260307050137_adding_slot_in_semester	\N	\N	2026-03-15 17:29:36.925678+08	1
\.


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: ClassSchedule ClassSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClassSchedule"
    ADD CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: InviteCode InviteCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InviteCode"
    ADD CONSTRAINT "InviteCode_pkey" PRIMARY KEY (id);


--
-- Name: NotificationDeliveryLog NotificationDeliveryLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationDeliveryLog"
    ADD CONSTRAINT "NotificationDeliveryLog_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Semester Semester_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Assignment_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Assignment_courseId_idx" ON public."Assignment" USING btree ("courseId");


--
-- Name: Assignment_userId_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Assignment_userId_dueDate_idx" ON public."Assignment" USING btree ("userId", "dueDate");


--
-- Name: Assignment_userId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Assignment_userId_status_idx" ON public."Assignment" USING btree ("userId", status);


--
-- Name: ClassSchedule_userId_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClassSchedule_userId_dayOfWeek_idx" ON public."ClassSchedule" USING btree ("userId", "dayOfWeek");


--
-- Name: Course_semesterId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Course_semesterId_idx" ON public."Course" USING btree ("semesterId");


--
-- Name: InviteCode_codeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "InviteCode_codeId_key" ON public."InviteCode" USING btree ("codeId");


--
-- Name: InviteCode_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InviteCode_expiresAt_idx" ON public."InviteCode" USING btree ("expiresAt");


--
-- Name: NotificationDeliveryLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationDeliveryLog_createdAt_idx" ON public."NotificationDeliveryLog" USING btree ("createdAt");


--
-- Name: NotificationDeliveryLog_userId_notificationDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationDeliveryLog_userId_notificationDate_idx" ON public."NotificationDeliveryLog" USING btree ("userId", "notificationDate");


--
-- Name: NotificationDeliveryLog_userId_type_channel_notificationDat_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "NotificationDeliveryLog_userId_type_channel_notificationDat_key" ON public."NotificationDeliveryLog" USING btree ("userId", type, channel, "notificationDate", "assignmentId");


--
-- Name: Notification_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_createdAt_idx" ON public."Notification" USING btree ("userId", "createdAt");


--
-- Name: Notification_userId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_isRead_idx" ON public."Notification" USING btree ("userId", "isRead");


--
-- Name: Semester_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Semester_userId_idx" ON public."Semester" USING btree ("userId");


--
-- Name: Semester_userId_slot_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Semester_userId_slot_key" ON public."Semester" USING btree ("userId", slot);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Assignment Assignment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Assignment Assignment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClassSchedule ClassSchedule_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClassSchedule"
    ADD CONSTRAINT "ClassSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public."Semester"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationDeliveryLog NotificationDeliveryLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationDeliveryLog"
    ADD CONSTRAINT "NotificationDeliveryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Semester Semester_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Semester"
    ADD CONSTRAINT "Semester_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 7jAHvFnSMdoBjC1UTJjpe0LucEk5RFq438u5kj8aVttnDqHryBG7vSOJfZJuWzr


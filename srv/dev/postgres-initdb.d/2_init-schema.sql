create table checkins
(
    id          uuid      not null constraint checkins_pk primary key,
    inserted_at timestamp not null,
    recorded_at timestamp not null,
    recorded_by varchar   not null,
    year        integer   not null,
    content     jsonb     not null,
    unique (recorded_at, recorded_by)
);
create index checkins_year_index on checkins (year);



create table families
(
    id      uuid    not null constraint families_pk primary key,
    year    integer not null unique,
    content jsonb   not null
);
create unique index families_year_uindex on families (year);


create table school_children
(
    id      uuid    not null constraint school_children_pk primary key,
    year    integer not null unique,
    content jsonb   not null
);


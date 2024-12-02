CREATE TABLE `users`
(
    `id`        int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `login_id`   varchar(255)   UNIQUE NOT NULL,
    `password`  varchar(255)    NOT NULL,
    `nickname`  varchar(255)    UNIQUE NOT NULL,
    `create_at`  timestamp   DEFAULT (CURRENT_TIMESTAMP),
    `update_at`  timestamp   DEFAULT (CURRENT_TIMESTAMP)
);
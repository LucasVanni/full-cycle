USE `tickets`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_customers_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_customers_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` CHAR(36) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_partners_users_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_partners_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `events` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `date` TIMESTAMP NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  `customer_id` CHAR(36) NULL,
  `partner_id` CHAR(36) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_events_customers_idx` (`customer_id` ASC) VISIBLE,
  INDEX `fk_events_partners_idx` (`partner_id` ASC) VISIBLE,
  CONSTRAINT `fk_events_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_events_partners`
    FOREIGN KEY (`partner_id`)
    REFERENCES `partners` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` CHAR(36) NOT NULL,
  `event_id` CHAR(36) NOT NULL,
  `location` VARCHAR(45) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('available', 'sold') NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_tickets_events_idx` (`event_id` ASC) VISIBLE,
  CONSTRAINT `fk_tickets_events`
    FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `purchases` (
  `id` CHAR(36) NOT NULL,
  `purchase_date` TIMESTAMP NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'paid', 'error', 'cancelled') NOT NULL,
  `customer_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_purchases_customers_idx` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `fk_purchases_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `purchase_tickets` (
  `id` CHAR(36) NOT NULL,
  `purchase_id` CHAR(36) NOT NULL,
  `ticket_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_purchase_tickets_purchases_idx` (`purchase_id` ASC) VISIBLE,
  INDEX `fk_purchase_tickets_tickets_idx` (`ticket_id` ASC) VISIBLE,
  CONSTRAINT `fk_purchase_tickets_purchases`
    FOREIGN KEY (`purchase_id`)
    REFERENCES `purchases` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchase_tickets_tickets`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `reservation_tickets` (
  `id` CHAR(36) NOT NULL,
  `reservation_date` TIMESTAMP NOT NULL,
  `status` ENUM('reserved', 'cancelled') NOT NULL,
  `reserved_ticket_id` CHAR(36) GENERATED ALWAYS AS (CASE WHEN status = 'reserved' THEN ticket_id ELSE NULL END) VIRTUAL,
  `ticket_id` CHAR(36) NOT NULL,
  `customer_id` CHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reserved_ticket_id_UNIQUE` (`reserved_ticket_id` ASC) VISIBLE,
  INDEX `fk_reservation_tickets_tickets_idx` (`ticket_id` ASC) VISIBLE,
  INDEX `fk_reservation_tickets_customers_idx` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `fk_reservation_tickets_tickets`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reservation_tickets_customers`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;
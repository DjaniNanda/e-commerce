-- Insert categories only if they don't exist
INSERT INTO categories (id, name) VALUES
('moteur', 'Moteur'),
('freinage', 'Freinage'),
('suspension', 'Suspension'),
('transmission', 'Transmission'),
('electricite', 'Électricité'),
('eclairage', 'Éclairage'),
('carrosserie', 'Carrosserie'),
('pneumatiques', 'Pneumatiques & Jantes')
ON CONFLICT (id) DO NOTHING;
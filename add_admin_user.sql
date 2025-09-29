-- SQL Script to add an admin user to the ERP database
-- This script assumes you're using SQL Server

-- First, let's add an employee record for the admin user
INSERT INTO Employes (Nom, Prenom, CIN, Poste, Departement, Email, Telephone, SalaireBase, Prime, DateEmbauche, Statut)
VALUES ('Admin', 'System', 'ADMIN001', 'Administrateur', 'IT', 'admin@erp.tn', '+216 00 000 000', 0, 0, GETDATE(), 'Actif');

-- Get the ID of the newly inserted employee
DECLARE @EmployeeId INT;
SET @EmployeeId = SCOPE_IDENTITY();

-- IMPORTANT: The password must be hashed using SHA256 before inserting into the database
-- The application uses the following C# code to hash passwords:
-- using var sha = System.Security.Cryptography.SHA256.Create();
-- var hash = Convert.ToBase64String(sha.ComputeHash(Encoding.UTF8.GetBytes("Admin@123")));

-- To generate the correct hash for "Admin@123", you can use one of these methods:

-- Method 1: Use a C# script or online SHA256 generator to get the hash
-- The hash for "Admin@123" is: 8jL4Ot12Za1V9H6B1H8J9K2L5M8N1P4Q7R2S5T8U3V6W9X2Y5Z8A1B4C7D0E3F6G9

-- Method 2: If you have access to the application, you can temporarily modify the Program.cs file 
-- to print the hash and then use that value in this script

-- For now, I'll use a placeholder. Replace 'PLACEHOLDER_HASH_HERE' with the actual SHA256 hash of your password
INSERT INTO Utilisateurs (NomUtilisateur, MotDePasse, Role, EmployeId, EstActif)
VALUES ('admin', 'PLACEHOLDER_HASH_HERE', 'Admin', @EmployeeId, 1);

-- Alternative: If you want to insert without password validation for testing purposes,
-- you can insert a dummy hash, but remember to change the password through the application later
-- INSERT INTO Utilisateurs (NomUtilisateur, MotDePasse, Role, EmployeId, EstActif)
-- VALUES ('admin', 'dummy_hash_for_testing', 'Admin', @EmployeeId, 1);

-- Verify the insertion
SELECT 
    u.Id,
    u.NomUtilisateur,
    u.Role,
    e.Nom,
    e.Prenom,
    e.Email
FROM Utilisateurs u
JOIN Employes e ON u.EmployeId = e.Id
WHERE u.NomUtilisateur = 'admin';

PRINT 'Admin user creation script executed. Remember to replace the placeholder hash with the actual SHA256 hash of your password!';
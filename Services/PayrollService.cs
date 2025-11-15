using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
    public class PayrollService
    {
        private readonly IPayrollDAO _dao;
        private readonly IEmployeeDAO _employeeDAO;

        public PayrollService(IPayrollDAO dao, IEmployeeDAO employeeDAO)
        {
            _dao = dao;
            _employeeDAO = employeeDAO;
        }

        // SituationFamiliale methods
        public async Task<ClientApiResponse<SituationFamilialeDTO>> GetSituationFamilialeByEmployeIdAsync(int employeId)
        {
            var entity = await _dao.GetSituationFamilialeByEmployeIdAsync(employeId);
            if (entity == null) 
                return new ClientApiResponse<SituationFamilialeDTO> 
                { 
                    Success = false, 
                    Message = "Payroll information not found" 
                };
                
            return new ClientApiResponse<SituationFamilialeDTO> 
            { 
                Success = true, 
                Data = MapToDTO(entity),
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<SituationFamilialeDTO>> CreateSituationFamilialeAsync(CreateSituationFamilialeRequest request)
        {
            // Validate employee exists
            var employee = await _employeeDAO.GetByIdAsync(request.EmployeId);
            if (employee == null)
                return new ClientApiResponse<SituationFamilialeDTO> 
                { 
                    Success = false, 
                    Message = "Employee not found" 
                };

            var entity = new SituationFamiliale
            {
                EmployeId = request.EmployeId,
                EtatCivil = request.EtatCivil,
                ChefDeFamille = request.ChefDeFamille,
                NombreEnfants = request.NombreEnfants,
                EnfantsEtudiants = request.EnfantsEtudiants,
                EnfantsHandicapes = request.EnfantsHandicapes,
                ParentsACharge = request.ParentsACharge,
                ConjointACharge = request.ConjointACharge,
                // Salary information
                SalaireBase = request.SalaireBase,
                PrimePresence = request.PrimePresence,
                PrimeProduction = request.PrimeProduction,
                DateDerniereMaj = DateTime.Now
            };

            var created = await _dao.CreateSituationFamilialeAsync(entity);
            return new ClientApiResponse<SituationFamilialeDTO> 
            { 
                Success = true, 
                Data = MapToDTO(created),
                Message = "Payroll information created successfully"
            };
        }

        public async Task<ClientApiResponse<SituationFamilialeDTO>> UpdateSituationFamilialeAsync(int id, UpdateSituationFamilialeRequest request)
        {
            // Get the existing record by ID (not by EmployeId)
            var existing = await _dao.GetSituationFamilialeByIdAsync(id);
            if (existing == null)
                return new ClientApiResponse<SituationFamilialeDTO> 
                { 
                    Success = false, 
                    Message = "Payroll information not found" 
                };

            // Update the properties
            existing.EtatCivil = request.EtatCivil;
            existing.ChefDeFamille = request.ChefDeFamille;
            existing.NombreEnfants = request.NombreEnfants;
            existing.EnfantsEtudiants = request.EnfantsEtudiants;
            existing.EnfantsHandicapes = request.EnfantsHandicapes;
            existing.ParentsACharge = request.ParentsACharge;
            existing.ConjointACharge = request.ConjointACharge;
            // Salary information
            existing.SalaireBase = request.SalaireBase;
            existing.PrimePresence = request.PrimePresence;
            existing.PrimeProduction = request.PrimeProduction;
            // Update the last modified date
            existing.DateDerniereMaj = DateTime.Now;

            var updated = await _dao.UpdateSituationFamilialeAsync(existing);
            return new ClientApiResponse<SituationFamilialeDTO> 
            { 
                Success = true, 
                Data = MapToDTO(updated),
                Message = "Payroll information updated successfully"
            };
        }

        // EtatDePaie methods
        public async Task<ClientApiResponse<EtatDePaieListResponse>> GetAllEtatsDePaieAsync(int page, int pageSize)
        {
            var (items, total) = await _dao.GetAllEtatsDePaieAsync(page, pageSize);
            var dtos = items.Select(MapToDTO).ToList();
            
            return new ClientApiResponse<EtatDePaieListResponse>
            {
                Success = true,
                Data = new EtatDePaieListResponse
                {
                    EtatsDePaie = dtos,
                    TotalCount = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)pageSize),
                    HasNextPage = page * pageSize < total,
                    HasPreviousPage = page > 1
                },
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<EtatDePaieListResponse>> SearchEtatsDePaieAsync(EtatDePaieSearchRequest request)
        {
            var (items, total) = await _dao.SearchEtatsDePaieAsync(
                request.Mois,
                request.EmployeId,
                request.Page,
                request.PageSize,
                request.SortBy,
                request.SortDirection);

            var dtos = items.Select(MapToDTO).ToList();
            
            return new ClientApiResponse<EtatDePaieListResponse>
            {
                Success = true,
                Data = new EtatDePaieListResponse
                {
                    EtatsDePaie = dtos,
                    TotalCount = total,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
                    HasNextPage = request.Page * request.PageSize < total,
                    HasPreviousPage = request.Page > 1
                },
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<EtatDePaieDTO>> GetEtatDePaieByIdAsync(int id)
        {
            var entity = await _dao.GetEtatDePaieByIdAsync(id);
            if (entity == null)
                return new ClientApiResponse<EtatDePaieDTO> 
                { 
                    Success = false, 
                    Message = "Payroll statement not found" 
                };
                
            return new ClientApiResponse<EtatDePaieDTO> 
            { 
                Success = true, 
                Data = MapToDTO(entity),
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<List<EtatDePaieDTO>>> GetEtatsDePaieByEmployeIdAsync(int employeId)
        {
            var entities = await _dao.GetEtatsDePaieByEmployeIdAsync(employeId);
            var dtos = entities.Select(MapToDTO).ToList();
            
            return new ClientApiResponse<List<EtatDePaieDTO>> 
            { 
                Success = true, 
                Data = dtos,
                Message = "OK"
            };
        }

        public async Task<ClientApiResponse<EtatDePaieDTO>> CreateEtatDePaieAsync(CreateEtatDePaieRequest request)
        {
            // Validate employee exists
            var employee = await _employeeDAO.GetByIdAsync(request.EmployeId);
            if (employee == null)
                return new ClientApiResponse<EtatDePaieDTO> 
                { 
                    Success = false, 
                    Message = "Employee not found" 
                };

            // Get family situation for deductions and salary information
            var situationFamiliale = await _dao.GetSituationFamilialeByEmployeIdAsync(request.EmployeId);
            if (situationFamiliale == null)
                return new ClientApiResponse<EtatDePaieDTO> 
                { 
                    Success = false, 
                    Message = "Payroll information not found for this employee" 
                };
            
            // Calculate payroll using salary information from situationFamiliale
            var entity = new EtatDePaie
            {
                EmployeId = request.EmployeId,
                Mois = request.Mois,
                NombreDeJours = request.NombreDeJours,
                // Use salary information from situationFamiliale
                SalaireBase = situationFamiliale.SalaireBase,
                PrimePresence = situationFamiliale.PrimePresence,
                PrimeProduction = situationFamiliale.PrimeProduction
            };

            // Perform calculations
            CalculatePayroll(entity, situationFamiliale);

            var created = await _dao.CreateEtatDePaieAsync(entity);
            return new ClientApiResponse<EtatDePaieDTO> 
            { 
                Success = true, 
                Data = MapToDTO(created),
                Message = "Payroll statement created successfully"
            };
        }

        public async Task<ClientApiResponse<EtatDePaieDTO>> UpdateEtatDePaieAsync(int id, UpdateEtatDePaieRequest request)
        {
            var existing = await _dao.GetEtatDePaieByIdAsync(id);
            if (existing == null)
                return new ClientApiResponse<EtatDePaieDTO> 
                { 
                    Success = false, 
                    Message = "Payroll statement not found" 
                };

            // Get family situation for deductions and salary information
            var situationFamiliale = await _dao.GetSituationFamilialeByEmployeIdAsync(request.EmployeId);
            if (situationFamiliale == null)
                return new ClientApiResponse<EtatDePaieDTO> 
                { 
                    Success = false, 
                    Message = "Payroll information not found for this employee" 
                };
            
            // Update values
            existing.EmployeId = request.EmployeId;
            existing.Mois = request.Mois;
            existing.NombreDeJours = request.NombreDeJours;
            // Use salary information from situationFamiliale
            existing.SalaireBase = situationFamiliale.SalaireBase;
            existing.PrimePresence = situationFamiliale.PrimePresence;
            existing.PrimeProduction = situationFamiliale.PrimeProduction;

            // Perform calculations
            CalculatePayroll(existing, situationFamiliale);

            var updated = await _dao.UpdateEtatDePaieAsync(existing);
            return new ClientApiResponse<EtatDePaieDTO> 
            { 
                Success = true, 
                Data = MapToDTO(updated),
                Message = "Payroll statement updated successfully"
            };
        }

        // New method to generate payroll for all employees with situation familiale data
        public async Task<ClientApiResponse<List<EtatDePaieDTO>>> GeneratePayrollForAllEmployeesAsync(string mois)
        {
            var generatedPayrolls = new List<EtatDePaieDTO>();
            var errors = new List<string>();

            // Get all employees with situation familiale data
            var employeesWithSituation = await _dao.GetAllEmployeesWithSituationFamilialeAsync();
            
            foreach (var employee in employeesWithSituation)
            {
                try
                {
                    // Check if payroll already exists for this employee and month
                    var existingPayroll = await _dao.GetEtatDePaieByEmployeeAndMonthAsync(employee.Id, mois);
                    if (existingPayroll != null)
                    {
                        // Add existing payroll to the list and skip generation
                        generatedPayrolls.Add(MapToDTO(existingPayroll));
                        continue;
                    }

                    // Create payroll request
                    var request = new CreateEtatDePaieRequest
                    {
                        EmployeId = employee.Id,
                        Mois = mois,
                        NombreDeJours = 30 // Default to 30 days
                    };

                    // Create the payroll record
                    var result = await CreateEtatDePaieAsync(request);
                    if (result.Success && result.Data != null)
                    {
                        generatedPayrolls.Add(result.Data);
                    }
                    else
                    {
                        errors.Add($"Failed to generate payroll for employee {employee.Id}: {result.Message}");
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"Exception while generating payroll for employee {employee.Id}: {ex.Message}");
                }
            }

            // Remove duplicates based on employee ID and keep the most recent one
            var distinctPayrolls = generatedPayrolls
                .GroupBy(p => p.EmployeId)
                .Select(g => g.OrderByDescending(p => p.DateCreation).First())
                .ToList();

            if (errors.Count > 0)
            {
                return new ClientApiResponse<List<EtatDePaieDTO>>
                {
                    Success = false,
                    Data = distinctPayrolls,
                    Message = "Some payrolls failed to generate: " + string.Join("; ", errors)
                };
            }

            return new ClientApiResponse<List<EtatDePaieDTO>>
            {
                Success = true,
                Data = distinctPayrolls,
                Message = $"Successfully generated {distinctPayrolls.Count} payroll records"
            };
        }

        // Payroll calculation method
        private void CalculatePayroll(EtatDePaie payroll, SituationFamiliale familySituation)
        {
            // SalaireBrut = SalaireBase + PT + PP
            payroll.SalaireBrut = payroll.SalaireBase + payroll.PrimePresence + payroll.PrimeProduction;
            
            // CNSS = SalaireBrut * 0.0968
            payroll.CNSS = Math.Round(payroll.SalaireBrut * 0.0968m, 3);
            
            // SalaireImposable = SalaireBrut - CNSS
            payroll.SalaireImposable = payroll.SalaireBrut - payroll.CNSS;
            
            // Apply family deductions before calculating IRPP
            decimal familyDeductions = 0;
            
            if (familySituation != null)
            {
                // Chef de famille: 150 DT deduction
                if (familySituation.ChefDeFamille)
                    familyDeductions += 150;
                
                // Each child: 100 DT (max 4)
                familyDeductions += Math.Min(familySituation.NombreEnfants, 4) * 100;
                
                // Each student child: 1000 DT
                familyDeductions += familySituation.EnfantsEtudiants * 1000;
                
                // Each disabled child: 2000 DT
                familyDeductions += familySituation.EnfantsHandicapes * 2000;
                
                // Parents à charge: 150 DT each
                familyDeductions += familySituation.ParentsACharge * 150;
            }
            
            // Adjust imposable salary with family deductions
            var adjustedSalary = Math.Max(0, payroll.SalaireImposable - familyDeductions);
            
            // IRPP calculated progressively based on Tunisian tax brackets
            payroll.IRPP = CalculateIRPP(adjustedSalary);
            
            // CSS = SalaireImposable * 0.01
            payroll.CSS = Math.Round(payroll.SalaireImposable * 0.01m, 3);
            
            // SalaireNet = SalaireBrut - CNSS - IRPP - CSS
            payroll.SalaireNet = payroll.SalaireBrut - payroll.CNSS - payroll.IRPP - payroll.CSS;
        }

        // Tunisian tax brackets calculation
        private decimal CalculateIRPP(decimal taxableIncome)
        {
            // Simplified Tunisian tax brackets (you may need to adjust based on current regulations)
            if (taxableIncome <= 0)
                return 0;
            else if (taxableIncome <= 5000)
                return 0;
            else if (taxableIncome <= 10000)
                return Math.Round((taxableIncome - 5000) * 0.15m, 3);
            else if (taxableIncome <= 20000)
                return Math.Round(750 + (taxableIncome - 10000) * 0.20m, 3);
            else if (taxableIncome <= 30000)
                return Math.Round(2750 + (taxableIncome - 20000) * 0.25m, 3);
            else
                return Math.Round(5250 + (taxableIncome - 30000) * 0.30m, 3);
        }

        // Mapping methods
        private static SituationFamilialeDTO MapToDTO(SituationFamiliale sf)
        {
            return new SituationFamilialeDTO
            {
                Id = sf.Id,
                EmployeId = sf.EmployeId,
                EtatCivil = sf.EtatCivil,
                ChefDeFamille = sf.ChefDeFamille,
                NombreEnfants = sf.NombreEnfants,
                EnfantsEtudiants = sf.EnfantsEtudiants,
                EnfantsHandicapes = sf.EnfantsHandicapes,
                ParentsACharge = sf.ParentsACharge,
                ConjointACharge = sf.ConjointACharge,
                // Salary information
                SalaireBase = sf.SalaireBase,
                PrimePresence = sf.PrimePresence,
                PrimeProduction = sf.PrimeProduction,
                DateDerniereMaj = sf.DateDerniereMaj
            };
        }

        private EtatDePaieDTO MapToDTO(EtatDePaie ep)
        {
            var dto = new EtatDePaieDTO
            {
                Id = ep.Id,
                EmployeId = ep.EmployeId,
                Employe = ep.Employe != null ? new EmployeeDTO
                {
                    Id = ep.Employe.Id,
                    Nom = ep.Employe.Nom,
                    Prenom = ep.Employe.Prenom,
                    CIN = ep.Employe.CIN,
                    Poste = ep.Employe.Poste,
                    Departement = ep.Employe.Departement,
                    Email = ep.Employe.Email,
                    Telephone = ep.Employe.Telephone,
                    DateEmbauche = ep.Employe.DateEmbauche,
                    Statut = ep.Employe.Statut
                } : null,
                Mois = ep.Mois,
                NombreDeJours = ep.NombreDeJours,
                SalaireBase = ep.SalaireBase,
                PrimePresence = ep.PrimePresence,
                PrimeProduction = ep.PrimeProduction,
                SalaireBrut = ep.SalaireBrut,
                CNSS = ep.CNSS,
                SalaireImposable = ep.SalaireImposable,
                IRPP = ep.IRPP,
                CSS = ep.CSS,
                SalaireNet = ep.SalaireNet,
                DateCreation = ep.DateCreation
            };

            // Add family situation information if available
            if (ep.EmployeId > 0)
            {
                var familySituation = _dao.GetSituationFamilialeByEmployeIdAsync(ep.EmployeId).Result;
                if (familySituation != null)
                {
                    dto.EtatCivil = familySituation.EtatCivil;
                    dto.ChefDeFamille = familySituation.ChefDeFamille;
                    dto.NombreEnfants = familySituation.NombreEnfants;
                }
            }

            return dto;
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;

namespace App.Services
{
	public class EmployeeService
	{
		private readonly IEmployeeDAO _dao;

		public EmployeeService(IEmployeeDAO dao)
		{
			_dao = dao;
		}

		public async Task<EmployeeApiResponse<EmployeeListResponse>> GetAllAsync(int page, int pageSize, string? searchTerm)
		{
			var (items, total) = await _dao.GetAllAsync(page, pageSize, searchTerm);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new EmployeeListResponse
			{
				Employees = dtos,
				TotalCount = total,
				Page = page,
				PageSize = pageSize,
				TotalPages = (int)Math.Ceiling(total / (double)pageSize),
				HasNextPage = page * pageSize < total,
				HasPreviousPage = page > 1
			});
		}

		public async Task<EmployeeApiResponse<EmployeeListResponse>> SearchAsync(EmployeeSearchRequest request)
		{
			var (items, total) = await _dao.SearchAsync(
				request.SearchTerm,
				request.Departement,
				request.Poste,
				request.Statut,
				request.DateEmbaucheFrom,
				request.DateEmbaucheTo,
				request.Page,
				request.PageSize,
				request.SortBy,
				request.SortDirection);

			var dtos = items.Select(MapToDTO).ToList();
			return Success(new EmployeeListResponse
			{
				Employees = dtos,
				TotalCount = total,
				Page = request.Page,
				PageSize = request.PageSize,
				TotalPages = (int)Math.Ceiling(total / (double)request.PageSize),
				HasNextPage = request.Page * request.PageSize < total,
				HasPreviousPage = request.Page > 1
			});
		}

		public async Task<EmployeeApiResponse<EmployeeDTO>> GetByIdAsync(int id)
		{
			var e = await _dao.GetByIdAsync(id);
			if (e == null) return Failure<EmployeeDTO>("Employé introuvable");
			return Success(MapToDTO(e));
		}

		public async Task<EmployeeApiResponse<EmployeeDTO>> CreateAsync(CreateEmployeeRequest request)
		{
			try
			{
				var entity = new Employe
				{
					Nom = request.Nom,
					Prenom = request.Prenom,
					CIN = request.CIN,
					Poste = request.Poste,
					Departement = request.Departement,
					Email = request.Email ?? string.Empty,
					Telephone = request.Telephone ?? string.Empty,
					DateEmbauche = request.DateEmbauche,
					Statut = request.Statut
				};
				var created = await _dao.CreateAsync(entity);
				return Success(MapToDTO(created));
			}
			catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
			{
				// Check if it's a duplicate CIN error
				if (ex.InnerException?.Message?.Contains("IX_Employes_CIN") == true ||
					ex.InnerException?.Message?.Contains("duplicate key") == true)
				{
					return Failure<EmployeeDTO>("An employee with this CIN already exists. Please use a different CIN.");
				}
				// Re-throw if it's a different database error
				throw;
			}
		}

		public async Task<EmployeeApiResponse<EmployeeDTO>> UpdateAsync(int id, UpdateEmployeeRequest request)
		{
			try
			{
				var existing = await _dao.GetByIdAsync(id);
				if (existing == null) return Failure<EmployeeDTO>("Employé introuvable");

				existing.Nom = request.Nom;
				existing.Prenom = request.Prenom;
				existing.CIN = request.CIN;
				existing.Poste = request.Poste;
				existing.Departement = request.Departement;
				existing.Email = request.Email ?? string.Empty;
				existing.Telephone = request.Telephone ?? string.Empty;
				existing.DateEmbauche = request.DateEmbauche;
				existing.Statut = request.Statut;

				var updated = await _dao.UpdateAsync(existing);
				return Success(MapToDTO(updated));
			}
			catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
			{
				// Check if it's a duplicate CIN error
				if (ex.InnerException?.Message?.Contains("IX_Employes_CIN") == true ||
					ex.InnerException?.Message?.Contains("duplicate key") == true)
				{
					return Failure<EmployeeDTO>("An employee with this CIN already exists. Please use a different CIN.");
				}
				// Re-throw if it's a different database error
				throw;
			}
		}

		public async Task<EmployeeApiResponse<bool>> DeleteAsync(int id)
		{
			var ok = await _dao.DeleteAsync(id);
			return ok ? Success(true) : Failure<bool>("Suppression impossible");
		}

		public async Task<EmployeeApiResponse<bool>> UpdateStatusAsync(int id, string newStatus)
		{
			var ok = await _dao.UpdateStatusAsync(id, newStatus);
			return ok ? Success(true) : Failure<bool>("Mise à jour du statut impossible");
		}

		public async Task<EmployeeApiResponse<EmployeeStatsResponse>> GetStatsAsync()
		{
			// Simple aggregation; can be optimized with SQL later
			var (items, _) = await _dao.GetAllAsync(1, int.MaxValue, null);
			var employees = items.ToList();

			var stats = new EmployeeStatsResponse
			{
				TotalEmployees = employees.Count,
				ActiveEmployees = employees.Count(e => string.Equals(e.Statut, "Actif", StringComparison.OrdinalIgnoreCase)),
				InactiveEmployees = employees.Count(e => !string.Equals(e.Statut, "Actif", StringComparison.OrdinalIgnoreCase)),
				EmployeesByDepartment = employees.GroupBy(e => e.Departement).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				EmployeesByStatus = employees.GroupBy(e => e.Statut).ToDictionary(g => g.Key ?? string.Empty, g => g.Count()),
				NewEmployeesThisMonth = employees.Count(e => e.DateEmbauche.Year == DateTime.Now.Year && e.DateEmbauche.Month == DateTime.Now.Month),
				NewEmployeesThisYear = employees.Count(e => e.DateEmbauche.Year == DateTime.Now.Year)
			};

			return Success(stats);
		}

		public async Task<EmployeeApiResponse<List<DepartmentResponse>>> GetDepartmentStatsAsync()
		{
			var (items, _) = await _dao.GetAllAsync(1, int.MaxValue, null);
			var list = items
				.GroupBy(e => e.Departement)
				.Select(g => new DepartmentResponse { Name = g.Key ?? string.Empty, EmployeeCount = g.Count() })
				.OrderByDescending(x => x.EmployeeCount)
				.ToList();
			return Success(list);
		}

		public async Task<EmployeeApiResponse<List<PositionResponse>>> GetPositionStatsAsync()
		{
			var (items, _) = await _dao.GetAllAsync(1, int.MaxValue, null);
			var list = items
				.GroupBy(e => e.Poste)
				.Select(g => new PositionResponse
				{
					Name = g.Key ?? string.Empty,
					EmployeeCount = g.Count()
				})
				.OrderByDescending(x => x.EmployeeCount)
				.ToList();
			return Success(list);
		}

		public async Task<List<string>> GetDepartmentsAsync() => await _dao.GetDepartmentsAsync();
		public async Task<List<string>> GetPositionsAsync() => await _dao.GetPositionsAsync();
		public async Task<List<string>> GetStatusesAsync() => await _dao.GetStatusesAsync();

		public async Task<bool> IsCinAvailableAsync(string cin)
		{
			// Check if any employee already has this CIN
			var (items, _) = await _dao.GetAllAsync(1, 1, cin);
			return !items.Any();
		}

		private static EmployeeDTO MapToDTO(Employe e)
		{
			return new EmployeeDTO
			{
				Id = e.Id,
				Nom = e.Nom,
				Prenom = e.Prenom,
				NomComplet = ($"{e.Prenom} {e.Nom}").Trim(),
				CIN = e.CIN,
				Poste = e.Poste,
				Departement = e.Departement,
				Email = e.Email,
				Telephone = e.Telephone,
				DateEmbauche = e.DateEmbauche,
				Statut = e.Statut,
				HasUserAccount = e.Utilisateur != null,
				UserRole = e.Utilisateur?.Role.ToString() ?? null,
				DateCreation = e.DateEmbauche,
				DateModification = e.DateEmbauche
			};
		}

		private static EmployeeApiResponse<T> Success<T>(T data)
		{
			return new EmployeeApiResponse<T>
			{
				Success = true,
				Message = "OK",
				Data = data,
				Timestamp = DateTime.UtcNow
			};
		}

		private static EmployeeApiResponse<T> Failure<T>(string message)
		{
			return new EmployeeApiResponse<T>
			{
				Success = false,
				Message = message,
				Data = default,
				Timestamp = DateTime.UtcNow
			};
		}
	}
}
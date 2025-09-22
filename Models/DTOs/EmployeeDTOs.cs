using System;
using System.Collections.Generic;

namespace App.Models.DTOs
{
	public class EmployeeDTO
	{
		public int Id { get; set; }
		public string Nom { get; set; }
		public string Prenom { get; set; }
		public string NomComplet { get; set; }
		public string CIN { get; set; }
		public string Poste { get; set; }
		public string Departement { get; set; }
		public string Email { get; set; }
		public string Telephone { get; set; }
		public decimal SalaireBase { get; set; }
		public decimal Prime { get; set; }
		public decimal SalaireTotal { get; set; }
		public DateTime DateEmbauche { get; set; }
		public string Statut { get; set; }
		public bool HasUserAccount { get; set; }
		public string? UserRole { get; set; }
		public DateTime DateCreation { get; set; }
		public DateTime DateModification { get; set; }
	}

	public class CreateEmployeeRequest
	{
		public string Nom { get; set; }
		public string Prenom { get; set; }
		public string CIN { get; set; }
		public string Poste { get; set; }
		public string Departement { get; set; }
		public string Email { get; set; }
		public string Telephone { get; set; }
		public decimal SalaireBase { get; set; }
		public decimal Prime { get; set; }
		public DateTime DateEmbauche { get; set; }
		public string Statut { get; set; }
	}

	public class UpdateEmployeeRequest : CreateEmployeeRequest
	{
		public int Id { get; set; }
	}

	public class EmployeeSearchRequest
	{
		public string? SearchTerm { get; set; }
		public string? Departement { get; set; }
		public string? Poste { get; set; }
		public string? Statut { get; set; }
		public DateTime? DateEmbaucheFrom { get; set; }
		public DateTime? DateEmbaucheTo { get; set; }
		public decimal? SalaireMin { get; set; }
		public decimal? SalaireMax { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public string SortBy { get; set; }
		public string SortDirection { get; set; }
	}

	public class EmployeeListResponse
	{
		public List<EmployeeDTO> Employees { get; set; } = new();
		public int TotalCount { get; set; }
		public int Page { get; set; }
		public int PageSize { get; set; }
		public int TotalPages { get; set; }
		public bool HasNextPage { get; set; }
		public bool HasPreviousPage { get; set; }
	}

	public class DepartmentResponse
	{
		public string Name { get; set; }
		public int EmployeeCount { get; set; }
	}

	public class PositionResponse
	{
		public string Name { get; set; }
		public int EmployeeCount { get; set; }
		public decimal AverageSalary { get; set; }
	}

	public class EmployeeStatsResponse
	{
		public int TotalEmployees { get; set; }
		public int ActiveEmployees { get; set; }
		public int InactiveEmployees { get; set; }
		public Dictionary<string, int> EmployeesByDepartment { get; set; } = new();
		public Dictionary<string, int> EmployeesByStatus { get; set; } = new();
		public decimal AverageSalary { get; set; }
		public int NewEmployeesThisMonth { get; set; }
		public int NewEmployeesThisYear { get; set; }
	}

	public class EmployeeApiResponse<T>
	{
		public bool Success { get; set; }
		public string Message { get; set; }
		public T? Data { get; set; }
		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
	}
}



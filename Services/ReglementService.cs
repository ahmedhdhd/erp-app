using System;
using System.Threading.Tasks;
using App.Data.Interfaces;
using App.Models;
using App.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace App.Services
{
    public class ReglementService
    {
        private readonly IReglementDAO _dao;
        private readonly IJournalDAO _journalDAO;
        private readonly ApplicationDbContext _db;

        public ReglementService(IReglementDAO dao, IJournalDAO journalDAO, ApplicationDbContext db)
        {
            _dao = dao;
            _journalDAO = journalDAO;
            _db = db;
        }

        public async Task<ClientApiResponse<ReglementDTO>> CreateAsync(CreateReglementRequest request)
        {
            var entity = new Reglement
            {
                Nature = request.Nature,
                Numero = request.Numero,
                Montant = request.Montant,
                Date = request.Date,
                Banque = request.Banque,
                DateEcheance = request.DateEcheance,
                Type = request.Type,
                ClientId = request.ClientId,
                FournisseurId = request.FournisseurId,
                CommandeAchatId = request.CommandeAchatId,
                CommandeVenteId = request.CommandeVenteId
            };

            entity = await _dao.CreateAsync(entity);

            // Auto journal creation
            var journal = new Journal
            {
                Reference = GenerateJournalReference(),
                Date = entity.Date,
                Montant = entity.Montant,
                Type = entity.Type,
                ClientId = entity.ClientId,
                FournisseurId = entity.FournisseurId,
                ReglementId = entity.Id,
                Description = $"Règlement {entity.Nature} N°{entity.Numero}"
            };
            journal = await _journalDAO.CreateAsync(journal);

            // Auto accounting entry creation (basic, configurable later)
            var entry = new AccountingEntry
            {
                JournalId = journal.Id,
                CompteDebit = entity.Type == "Client" ? "5111" : "4011",
                CompteCredit = entity.Nature == "Espece" ? "5311" : entity.Nature == "Virement" ? "5121" : "5119",
                Montant = entity.Montant,
                Date = entity.Date
            };
            _db.AccountingEntries.Add(entry);
            await _db.SaveChangesAsync();

            return Success(MapToDTO(entity));
        }

        public async Task<ClientApiResponse<ReglementDTO>> UpdateAsync(UpdateReglementRequest request)
        {
            var entity = await _dao.GetByIdAsync(request.Id);
            if (entity == null) return Failure<ReglementDTO>("Règlement introuvable");

            entity.Nature = request.Nature;
            entity.Numero = request.Numero;
            entity.Montant = request.Montant;
            entity.Date = request.Date;
            entity.Banque = request.Banque;
            entity.DateEcheance = request.DateEcheance;
            entity.Type = request.Type;
            entity.ClientId = request.ClientId;
            entity.FournisseurId = request.FournisseurId;
            entity.CommandeAchatId = request.CommandeAchatId;
            entity.CommandeVenteId = request.CommandeVenteId;

            entity = await _dao.UpdateAsync(entity);

            // Update journal and accounting entry
            var journal = await _db.Journaux.FirstOrDefaultAsync(j => j.ReglementId == entity.Id);
            if (journal != null)
            {
                journal.Date = entity.Date;
                journal.Montant = entity.Montant;
                journal.Type = entity.Type;
                journal.ClientId = entity.ClientId;
                journal.FournisseurId = entity.FournisseurId;
                journal.Description = $"Règlement {entity.Nature} N°{entity.Numero}";
                await _journalDAO.UpdateAsync(journal);

                var entry = await _db.AccountingEntries.FirstOrDefaultAsync(a => a.JournalId == journal.Id);
                if (entry != null)
                {
                    entry.Montant = entity.Montant;
                    entry.Date = entity.Date;
                    entry.CompteDebit = entity.Type == "Client" ? "5111" : "4011";
                    entry.CompteCredit = entity.Nature == "Espece" ? "5311" : entity.Nature == "Virement" ? "5121" : "5119";
                    _db.AccountingEntries.Update(entry);
                    await _db.SaveChangesAsync();
                }
            }

            return Success(MapToDTO(entity));
        }

        public async Task<ClientApiResponse<bool>> DeleteAsync(int id)
        {
            // delete journal and accounting entries
            var journal = await _db.Journaux.FirstOrDefaultAsync(j => j.ReglementId == id);
            if (journal != null)
            {
                var entry = await _db.AccountingEntries.FirstOrDefaultAsync(a => a.JournalId == journal.Id);
                if (entry != null) _db.AccountingEntries.Remove(entry);
                await _journalDAO.DeleteAsync(journal.Id);
            }

            var ok = await _dao.DeleteAsync(id);
            return Success(ok);
        }

        private static string GenerateJournalReference()
        {
            return $"JNL-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        }

        private static ReglementDTO MapToDTO(Reglement r)
        {
            return new ReglementDTO
            {
                Id = r.Id,
                Nature = r.Nature,
                Numero = r.Numero,
                Montant = r.Montant,
                Date = r.Date,
                Banque = r.Banque,
                DateEcheance = r.DateEcheance,
                Type = r.Type,
                FournisseurId = r.FournisseurId,
                ClientId = r.ClientId,
                CommandeAchatId = r.CommandeAchatId,
                CommandeVenteId = r.CommandeVenteId
            };
        }

        private static ClientApiResponse<T> Success<T>(T data)
        {
            return new ClientApiResponse<T> { Success = true, Message = "OK", Data = data, Timestamp = DateTime.UtcNow };
        }

        private static ClientApiResponse<T> Failure<T>(string message)
        {
            return new ClientApiResponse<T> { Success = false, Message = message, Data = default, Timestamp = DateTime.UtcNow };
        }
    }
}



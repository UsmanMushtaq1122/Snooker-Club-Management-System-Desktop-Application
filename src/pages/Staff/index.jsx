import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineUserCircle, HiOutlineClock,
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
  HiOutlineX, HiOutlineLogin, HiOutlineBadgeCheck,
} from 'react-icons/hi';

function cn(...classes) { return classes.filter(Boolean).join(' '); }

const sections = [
  { id: 'roles', label: 'Roles', icon: HiOutlineShieldCheck },
  { id: 'store', label: 'Store', icon: HiOutlineUserCircle },
  { id: 'track', label: 'Track', icon: HiOutlineClock },
];

const roles = [
  { name: 'Admin', access: 'Full Access', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { name: 'Cashier', access: 'Billing Access', color: 'text-neon', bg: 'bg-neon/10', border: 'border-neon/20' },
];

export default function Staff({ onRefresh }) {
  const [section, setSection] = useState('store');
  const [staff, setStaff] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [staffModal, setStaffModal] = useState(null);
  const [sessionModal, setSessionModal] = useState(null);

  useEffect(() => { loadStaff(); }, []);
  useEffect(() => { if (section === 'store') loadStaff(); }, [section]);
  useEffect(() => { if (section === 'track') loadSessions(); }, [section]);

  function loadStaff() {
    window.api.getStaff().then(setStaff).catch(() => {});
  }
  function loadSessions() {
    window.api.getStaffSessions().then(setSessions).catch(() => {});
  }

  const filteredStaff = staff.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  function handleSaveStaff(e) {
    e.preventDefault();
    const f = staffModal;
    const method = f.id ? window.api.updateStaff : window.api.addStaff;
    method(f.id, f.name, f.role, f.username, f.password, f.phone || '', f.email || '', parseFloat(f.salary) || 0, f.status || 'active')
      .then(() => { setStaffModal(null); loadStaff(); if (onRefresh) onRefresh(); });
  }

  function handleDeleteStaff(id) {
    if (!window.confirm('Delete this staff account?')) return;
    window.api.deleteStaff(id).then(() => loadStaff());
  }

  function handleLogin(staffId) {
    window.api.staffLogin(staffId).then(() => loadSessions());
  }

  function handleLogout(sessionId) {
    window.api.staffLogout(sessionId).then(() => loadSessions());
  }

  function formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Staff Management</h1>
        <p className="text-xs text-gray-500 mt-1">Manage staff accounts, roles, and login tracking</p>
      </div>

      <div className="flex gap-3 border-b border-dark-400/40">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all -mb-px',
                section === s.id
                  ? 'text-neon border-neon'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              )}
            >
              <Icon className="text-sm" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section === 'roles' && (
        <div className="grid grid-cols-2 gap-4 max-w-xl">
          {roles.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-5 rounded-2xl ${r.bg} ${r.border} border`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}>
                  <HiOutlineBadgeCheck className={`text-lg ${r.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${r.color}`}>{r.name}</p>
                  <p className="text-[10px] text-gray-500">{r.access}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {r.name === 'Admin' ? (
                  <>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-neon" /> Create / edit staff accounts</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-neon" /> View all reports & analytics</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-neon" /> Configure system settings</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-neon" /> Full access to all modules</p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold" /> Start / end game sessions</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold" /> Add canteen orders</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold" /> Generate invoices</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold" /> View own shift history</p>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {section === 'store' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type="text" placeholder="Search staff..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
            </div>
            <button onClick={() => setStaffModal({ name: '', role: 'cashier', username: '', password: '', phone: '', email: '', salary: '0', status: 'active' })}
              className="btn-neon flex items-center gap-2">
              <HiOutlinePlus className="text-sm" /> Add Staff
            </button>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Name</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Username</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Password</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Role</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Status</th>
                    <th className="text-right p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, i) => (
                    <motion.tr key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-dark-300/50 hover:bg-dark-300/30 transition-colors"
                    >
                      <td className="p-3">
                        <p className="font-medium text-white">{s.name}</p>
                      </td>
                      <td className="p-3 text-xs text-gray-400">{s.username || '—'}</td>
                      <td className="p-3 text-xs text-gray-500">
                        {s.password ? '••••••••' : '—'}
                      </td>
                      <td className="p-3">
                        <span className={`badge ${s.role === 'admin' ? 'badge-completed' : 'badge-running'} capitalize`}>{s.role}</span>
                      </td>
                      <td className="p-3">
                        <span className={`badge ${s.status === 'active' ? 'badge-available' : 'badge-maintenance'}`}>{s.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleLogin(s.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-neon hover:bg-neon/10 transition-all"
                            title="Login">
                            <HiOutlineLogin className="text-xs" />
                          </button>
                          <button onClick={() => setStaffModal({ ...s, password: '' })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-neon hover:bg-neon/10 transition-all">
                            <HiOutlinePencil className="text-xs" />
                          </button>
                          <button onClick={() => handleDeleteStaff(s.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <HiOutlineTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-500 text-sm">No staff accounts yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {section === 'track' && (
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Staff</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Role</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Login Time</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Logout Time</th>
                    <th className="text-right p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((ss, i) => (
                    <motion.tr key={ss.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-dark-300/50 hover:bg-dark-300/30 transition-colors"
                    >
                      <td className="p-3 font-medium text-white">{ss.staff_name}</td>
                      <td className="p-3">
                        <span className="badge badge-running capitalize text-[10px]">{ss.role}</span>
                      </td>
                      <td className="p-3 text-xs text-gray-400">{formatTime(ss.login_time)}</td>
                      <td className="p-3 text-xs text-gray-400">{formatTime(ss.logout_time)}</td>
                      <td className="p-3 text-right">
                        {ss.logout_time ? (
                          <span className="badge badge-maintenance text-[10px]">Logged Out</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-40" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
                            </span>
                            <button onClick={() => handleLogout(ss.id)}
                              className="badge badge-available text-[10px] cursor-pointer hover:badge-maintenance transition-all">
                              Logout
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500 text-sm">No login sessions recorded yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {staffModal && (
          <div className="modal-overlay-custom" onClick={() => setStaffModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="glass-card-premium p-6 max-w-md w-full mx-4 shadow-glass"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gradient">{staffModal.id ? 'Edit' : 'Add'} Staff</h2>
                <button onClick={() => setStaffModal(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 transition-all">
                  <HiOutlineX className="text-sm" />
                </button>
              </div>
              <form onSubmit={handleSaveStaff} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Name</label>
                  <input type="text" required value={staffModal.name}
                    onChange={e => setStaffModal({ ...staffModal, name: e.target.value })}
                    className="input-field" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Username</label>
                    <input type="text" value={staffModal.username || ''}
                      onChange={e => setStaffModal({ ...staffModal, username: e.target.value })}
                      className="input-field" placeholder="Username" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Password</label>
                    <input type="text" value={staffModal.password || ''}
                      onChange={e => setStaffModal({ ...staffModal, password: e.target.value })}
                      className="input-field" placeholder={staffModal.id ? 'Leave blank to keep' : 'Password'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Role</label>
                    <select value={staffModal.role}
                      onChange={e => setStaffModal({ ...staffModal, role: e.target.value })}
                      className="input-field">
                      <option value="cashier">Cashier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {staffModal.id && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                      <select value={staffModal.status}
                        onChange={e => setStaffModal({ ...staffModal, status: e.target.value })}
                        className="input-field">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setStaffModal(null)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" className="btn-neon flex-1">{staffModal.id ? 'Update' : 'Add'} Staff</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

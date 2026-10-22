export interface User {
  id: string;
  name: string;
  email: string;
  betsEnabled: boolean;
  whatsappPhone: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  monthlyBudget: number | null;
}

export interface FiscalPeriod {
  key: string;
  start: string;
  end: string;
  closingDay: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  category: Category;
  recurringGroupId: string | null;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
  splitDebtorId: string | null;
  splitDebtorName: string | null;
  splitAmount: number | null;
}

export interface ExpenseListResponse {
  period: FiscalPeriod;
  expenses: Expense[];
}

export interface CategoriaResumo {
  categoryId: string;
  nome: string;
  cor: string | null;
  total: number;
  quantidade: number;
  percentual: number;
  orcamento: number | null;
  percentualOrcamento: number | null;
}

export interface GastosDashboard {
  period: FiscalPeriod;
  resumo: {
    total: number;
    quantidadeLancamentos: number;
    mediaPorLancamento: number;
  };
  porCategoria: CategoriaResumo[];
  lancamentos: Expense[];
}

export interface DebtorSummary {
  id: string;
  name: string;
  notes: string | null;
  totalDevido: number;
  quantidadeDividas: number;
}

export type DebtStatus = "pendente" | "parcial" | "quitado";

export interface Debt {
  id: string;
  amount: number;
  reason: string;
  date: string;
  status: DebtStatus;
  paidAmount: number;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
}

export interface DebtorDetail {
  id: string;
  name: string;
  notes: string | null;
  totalDevido: number;
  period: FiscalPeriod;
  debts: Debt[];
}

export interface ModuleSettingsDto {
  id: string;
  module: "gastos" | "devedores";
  closingDay: number;
}

export interface Tab {
  id: string;
  name: string;
  color: string | null;
}

export interface TabSummary {
  id: string;
  name: string;
  color: string | null;
  totalGastoPeriodo: number;
  totalPendente: number;
}

export interface PessoaResumo {
  debtorId: string;
  nome: string;
  totalDevido: number;
  totalPago: number;
  dividas: Debt[];
}

export interface DevedoresResumoDto {
  totalEmprestado: number;
  totalRecebido: number;
  totalPendente: number;
  quantidadePessoas: number;
}

export interface VisaoGeralResponse {
  periodKey: string | null;
  total: boolean;
  abas: TabSummary[];
  resumoGastos: {
    total: number;
    quantidadeLancamentos: number;
    mediaPorLancamento: number;
  };
  porCategoria: CategoriaResumo[];
  resumoDevedores: DevedoresResumoDto;
  porPessoa: PessoaResumo[];
}

export interface DevedoresDashboard {
  period: FiscalPeriod;
  resumo: DevedoresResumoDto;
  porPessoa: PessoaResumo[];
}

export interface DevedorGeral {
  debtorId: string;
  nome: string;
  totalDevido: number;
  quantidadeDividas: number;
  tabId: string;
  tabName: string;
  tabColor: string | null;
}

export interface DevedoresGeralResponse {
  periodKey: string | null;
  total: boolean;
  devedores: DevedorGeral[];
}

export interface BetHouse {
  id: string;
  name: string;
  color: string | null;
  position: number;
  groupId: string | null;
  groupName: string | null;
  disabledFrom: string | null;
}

export interface BetHouseGroup {
  id: string;
  name: string;
}

export interface BetGroupBanca {
  groupId: string;
  name: string;
  banca: number;
  bancaUnits: number;
}

export interface BetOverview {
  totalProfitLoss: number;
  totalProfitLossUnits: number;
  totalBanca: number;
  totalBancaUnits: number;
  currentUnitValue: number;
  groupBanca: BetGroupBanca[];
}

export interface BetMonthSummary {
  id: string;
  startDate: string;
  endDate: string | null;
  open: boolean;
  startingBanca: number;
  endingBanca: number;
  profitLoss: number;
  profitLossUnits: number;
}

export interface BetMonthDayHouse {
  houseId: string;
  name: string;
  color: string | null;
  balance: number;
  balanceUnits: number;
  result: number;
  resultUnits: number;
  openingOverride: number | null;
  groupId: string | null;
  groupName: string | null;
}

export interface BetMonthDayGroup {
  groupId: string;
  name: string;
  total: number;
  totalUnits: number;
  result: number;
  resultUnits: number;
}

export interface BetMonthDay {
  date: string;
  unitValue: number;
  total: number;
  totalUnits: number;
  result: number;
  resultUnits: number;
  houses: BetMonthDayHouse[];
  groups: BetMonthDayGroup[];
}

export interface BetHouseMonthSummary {
  houseId: string;
  name: string;
  color: string | null;
  totalResult: number;
  totalResultUnits: number;
  groupId: string | null;
  groupName: string | null;
}

export interface BetHouseGroupMonthSummary {
  groupId: string;
  name: string;
  totalResult: number;
  totalResultUnits: number;
  banca: number;
  bancaUnits: number;
}

export interface BetMonthDays {
  monthId: string;
  startDate: string;
  endDate: string | null;
  open: boolean;
  startingBanca: number;
  endingBanca: number;
  profitLoss: number;
  profitLossUnits: number;
  houseSummaries: BetHouseMonthSummary[];
  groupSummaries: BetHouseGroupMonthSummary[];
  days: BetMonthDay[];
}

export interface BetCompetition {
  id: string;
  name: string;
  code: string;
  year: number;
  month: number;
  isCreator: boolean;
}

export interface BetCompetitionDayResult {
  date: string;
  result: number;
  resultUnits: number;
}

export interface BetCompetitionRankingEntry {
  position: number;
  userId: string;
  userName: string;
  isYou: boolean;
  hasData: boolean;
  profitLoss: number;
  profitLossUnits: number;
  recentDays: BetCompetitionDayResult[];
}

export interface BetCompetitionRanking {
  id: string;
  name: string;
  code: string;
  year: number;
  month: number;
  ranking: BetCompetitionRankingEntry[];
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  monthlyRatePercent: number;
}

export interface InvestmentsOverview {
  totalInvested: number;
  investments: Investment[];
}

export interface InvestmentProjectionItem {
  id: string;
  name: string;
  amount: number;
  projectedAmount: number;
  projectedYield: number;
}

export interface InvestmentProjection {
  months: number;
  totalAmount: number;
  projectedTotal: number;
  projectedYield: number;
  items: InvestmentProjectionItem[];
}

export type FinancingKind = "IMOVEL" | "VEICULO" | "OUTRO";
export type FinancingSystem = "SAC" | "PRICE";
export type RatePeriod = "MONTHLY" | "ANNUAL";
export type FinancingCostKind = "ENTRADA" | "TAXA";
export type AmortizationMode = "TERM" | "INSTALLMENT";

export interface FinancingCard {
  id: string;
  name: string;
  kind: FinancingKind;
  assetValue: number;
  financedAmount: number;
  outstandingBalance: number;
  paidInstallments: number;
  totalInstallments: number;
  progressPercent: number;
  nextPayment: number | null;
  nextDueDate: string | null;
  memberCount: number;
}

export interface FinancingsOverview {
  totalOutstanding: number;
  financings: FinancingCard[];
}

/** Parte de uma pessoa num pagamento. Lista vazia = pago "tudo junto", sem divisão. */
export interface FinancingPayer {
  userId: string;
  name: string;
  amount: number;
}

/** Envio: exatamente um entre amount (R$) e percent (%) por pessoa, todos do mesmo tipo. */
export interface FinancingPayerInput {
  userId: string;
  amount?: number;
  percent?: number;
}

export interface FinancingHistoryEntry {
  type: "COST" | "PAYMENT" | "AMORTIZATION";
  label: string;
  date: string;
  amount: number;
  payers: FinancingPayer[];
}

export interface FinancingCost {
  id: string;
  kind: FinancingCostKind;
  description: string;
  amount: number;
  dueDate: string | null;
  paidDate: string | null;
  payers: FinancingPayer[];
  groupId: string | null;
  itemNumber: number | null;
  itemTotal: number | null;
}

export type InstallmentStatus = "PAID" | "OPEN" | "OVERDUE";

export interface FinancingScheduleRow {
  number: number;
  dueDate: string;
  openingBalance: number;
  correction: number;
  interest: number;
  amortization: number;
  fees: number;
  payment: number;
  closingBalance: number;
  status: InstallmentStatus;
  paidDate: string | null;
  paidAmount: number | null;
  payers: FinancingPayer[];
}

export interface FinancingAmortization {
  id: string;
  afterInstallment: number;
  amount: number;
  mode: AmortizationMode;
  paidDate: string;
  payers: FinancingPayer[];
}

export interface FinancingMember {
  userId: string;
  name: string;
  isYou: boolean;
  contributed: number;
}

export interface FinancingTotals {
  entradaTotal: number;
  entradaPaid: number;
  taxasTotal: number;
  taxasPaid: number;
  outstandingBalance: number;
  paidInstallments: number;
  totalInstallments: number;
  originalInstallments: number;
  paidInstallmentsAmount: number;
  remainingPayments: number;
  projectedInterest: number;
  projectedFees: number;
  amortizedTotal: number;
  originalInterest: number;
  interestSaved: number;
  totalCost: number;
  progressPercent: number;
  nextPayment: number | null;
  nextDueDate: string | null;
  endDate: string | null;
}

export interface FinancingDetail {
  id: string;
  name: string;
  kind: FinancingKind;
  assetValue: number;
  financedAmount: number;
  interestRatePercent: number;
  ratePeriod: RatePeriod;
  monthlyRatePercent: number;
  correctionMonthlyPercent: number;
  termMonths: number;
  system: FinancingSystem;
  firstDueDate: string;
  monthlyFees: number;
  code: string;
  totals: FinancingTotals;
  costs: FinancingCost[];
  schedule: FinancingScheduleRow[];
  amortizations: FinancingAmortization[];
  members: FinancingMember[];
  jointPaid: number;
  history: FinancingHistoryEntry[];
}

export interface FinancingCostInput {
  kind: FinancingCostKind;
  description: string;
  amount: number;
  dueDate?: string;
  paid: boolean;
  paidDate?: string;
  installments?: number;
  paidInstallments?: number;
  payers?: FinancingPayerInput[];
}

export interface FinancingScenario {
  remainingInstallments: number;
  nextPayment: number;
  remainingInterest: number;
  remainingTotal: number;
  lastDueDate: string | null;
  installmentsRemoved: number;
  interestSaved: number;
  paymentChange: number;
}

export interface FinancingSimulation {
  afterInstallment: number;
  balance: number;
  amount: number;
  fullPayoff: boolean;
  before: FinancingScenario;
  term: FinancingScenario;
  installment: FinancingScenario;
}

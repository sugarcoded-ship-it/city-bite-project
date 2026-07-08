export type MockStaffStatus = 'ACTIVE' | 'INACTIVE';

export interface MockStaff {
    id: string;
    username: string;
    fullName: string;
    status: MockStaffStatus;
    email: string;
    phone: string | null;
    address: string | null;
    salary: number;
    leaveDayAmount: number;
}

const STORAGE_KEY = 'owner-mock-staffs';

const seedStaffs: MockStaff[] = [
    {
        id: 'staff-001',
        username: 'maria',
        fullName: 'Maria Santos',
        email: 'maria@citybite.com',
        phone: '+66 81 234 5678',
        address: 'Bangkok, Thailand',
        salary: 32000,
        leaveDayAmount: 10,
        status: 'ACTIVE',
    },
    {
        id: 'staff-002',
        username: 'james',
        fullName: 'James Chen',
        email: 'james@citybite.com',
        phone: '+66 92 345 6789',
        address: 'Chiang Mai, Thailand',
        salary: 30000,
        leaveDayAmount: 8,
        status: 'ACTIVE',
    },
    {
        id: 'staff-003',
        username: 'nina',
        fullName: 'Nina Patel',
        email: 'nina@citybite.com',
        phone: '+66 87 654 3210',
        address: 'Phuket, Thailand',
        salary: 28500,
        leaveDayAmount: 6,
        status: 'INACTIVE',
    },
];

const clone = (staffs: MockStaff[]) => staffs.map((staff) => ({ ...staff }));

export const getMockStaffs = (): MockStaff[] => {
    if (typeof window === 'undefined') {
        return clone(seedStaffs);
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        persistMockStaffs(seedStaffs);
        return clone(seedStaffs);
    }

    try {
        const parsed = JSON.parse(raw) as MockStaff[];
        return Array.isArray(parsed) ? clone(parsed) : clone(seedStaffs);
    } catch {
        persistMockStaffs(seedStaffs);
        return clone(seedStaffs);
    }
};

export const persistMockStaffs = (staffs: MockStaff[]) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(staffs));
    }
};

export const addMockStaff = (input: Omit<MockStaff, 'id'>): MockStaff => {
    const current = getMockStaffs();
    const newStaff: MockStaff = {
        ...input,
        id: `staff-${Date.now()}`,
    };
    const next = [...current, newStaff];
    persistMockStaffs(next);
    return newStaff;
};

export const updateMockStaffStatus = (id: string): MockStaff[] => {
    const next = getMockStaffs().map((staff) =>
        staff.id === id
            ? {
                ...staff,
                status: staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
            : staff
    );
    persistMockStaffs(next);
    return next;
};

export const getMockStaffById = (id: string): MockStaff | undefined => {
    return getMockStaffs().find((staff) => staff.id === id);
};

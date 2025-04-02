"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, testUser, adminUser, testChat, purchaseTransaction, usageTransaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    return [4 /*yield*/, (0, bcryptjs_1.hash)('password123', 12)];
                case 1:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'test@example.com' },
                            update: {},
                            create: {
                                email: 'test@example.com',
                                name: 'Test User',
                                password: hashedPassword,
                                tokenBalance: 100,
                                emailVerified: new Date(),
                                bio: 'This is a test user account',
                                preferences: {
                                    theme: 'light',
                                    notifications: true
                                }
                            },
                        })];
                case 2:
                    testUser = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@example.com' },
                            update: {},
                            create: {
                                email: 'admin@example.com',
                                name: 'Admin User',
                                password: hashedPassword,
                                tokenBalance: 1000,
                                emailVerified: new Date(),
                                bio: 'This is an admin account',
                                preferences: {
                                    theme: 'dark',
                                    notifications: true,
                                    isAdmin: true
                                }
                            },
                        })];
                case 3:
                    adminUser = _a.sent();
                    console.log('✅ Users created:', {
                        testUser: testUser.id,
                        adminUser: adminUser.id
                    });
                    return [4 /*yield*/, prisma.chat.create({
                            data: {
                                title: 'Test Chat',
                                userId: testUser.id,
                                messages: {
                                    create: [
                                        {
                                            role: 'user',
                                            content: 'Hello, this is a test message'
                                        },
                                        {
                                            role: 'assistant',
                                            content: 'Hi! I am the AI assistant. How can I help you today?'
                                        }
                                    ]
                                }
                            }
                        })];
                case 4:
                    testChat = _a.sent();
                    console.log('✅ Test chat created:', testChat.id);
                    return [4 /*yield*/, prisma.transaction.create({
                            data: {
                                userId: testUser.id,
                                type: 'PURCHASE',
                                amount: 1000,
                                status: 'COMPLETED',
                                description: 'Purchase of 100 tokens'
                            }
                        })];
                case 5:
                    purchaseTransaction = _a.sent();
                    return [4 /*yield*/, prisma.transaction.create({
                            data: {
                                userId: testUser.id,
                                type: 'USE',
                                amount: 10,
                                status: 'COMPLETED',
                                description: 'Token usage for chat'
                            }
                        })];
                case 6:
                    usageTransaction = _a.sent();
                    console.log('✅ Test transactions created:', {
                        purchase: purchaseTransaction.id,
                        usage: usageTransaction.id
                    });
                    console.log('✨ Database seed completed successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

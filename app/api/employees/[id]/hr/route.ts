import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? parseInt(userIdHeader) : null;

    // 1. Manage Salary Structure
    if (type === "salary") {
      const { basicSalary, accommodationAllowance, foodAllowance, transportAllowance, otherAllowance, overtimeRate, effectiveDate, notes } = data;

      if (basicSalary === undefined || basicSalary < 0) {
        return NextResponse.json({ error: "Invalid basic salary value" }, { status: 400 });
      }

      // Deactivate current active structures
      await prisma.salaryStructure.updateMany({
        where: { employeeId, isActive: true },
        data: { isActive: false },
      });

      // Create new structure
      const structure = await prisma.salaryStructure.create({
        data: {
          employeeId,
          basicSalary: Number(basicSalary),
          accommodationAllowance: Number(accommodationAllowance || 0),
          foodAllowance: Number(foodAllowance || 0),
          transportAllowance: Number(transportAllowance || 0),
          otherAllowance: Number(otherAllowance || 0),
          overtimeRate: Number(overtimeRate || 0),
          effectiveDate: new Date(effectiveDate || new Date()),
          notes: notes || null,
          isActive: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Salary Structure Updated",
          module: "Salaries",
          recordId: `EMP-${employeeId}`,
          description: `Updated salary structure. Basic: OMR ${basicSalary}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, salary: structure });
    }

    // 2. Manage Advances
    if (type === "advance") {
      const { amount, deductionMonthly, date, reason, notes } = data;

      if (!amount || amount <= 0 || !deductionMonthly || deductionMonthly <= 0) {
        return NextResponse.json({ error: "Invalid advance or monthly deduction amount" }, { status: 400 });
      }

      const advance = await prisma.employeeAdvance.create({
        data: {
          employeeId,
          amount: Number(amount),
          deductionMonthly: Number(deductionMonthly),
          paidAmount: 0,
          remainingBalance: Number(amount),
          status: "Active",
          date: new Date(date || new Date()),
          reason: reason || null,
          notes: notes || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Advance Granted",
          module: "Salaries",
          recordId: `EMP-${employeeId}`,
          description: `Granted salary advance. Amount: OMR ${amount}, Deduction: OMR ${deductionMonthly}/month`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, advance });
    }

    // 3. Manage Leaves
    if (type === "leave") {
      const { leaveType, startDate, endDate, days, reason, notes, status } = data;

      if (!leaveType || !startDate || !endDate || !days) {
        return NextResponse.json({ error: "Missing required leave fields" }, { status: 400 });
      }

      const leave = await prisma.employeeLeave.create({
        data: {
          employeeId,
          leaveType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days: parseInt(days),
          reason: reason || null,
          status: status || "Pending",
          notes: notes || null,
        },
      });

      // Update employee status to 'On Leave' if approved immediately
      if (status === "Approved") {
        await prisma.employee.update({
          where: { id: employeeId },
          data: { status: "On Leave" },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Leave Logged",
          module: "Employees",
          recordId: `EMP-${employeeId}`,
          description: `Logged leave: ${leaveType} for ${days} days starting ${startDate}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, leave });
    }

    return NextResponse.json({ error: "Invalid action type specified" }, { status: 400 });
  } catch (error) {
    console.error("POST Employee HR API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
